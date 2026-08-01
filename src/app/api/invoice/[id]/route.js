import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { ethers } from 'ethers';
import { triggerWebhook } from '@/lib/webhooks';
import { sendEmail } from '@/lib/mail';

// Lowercase addresses to bypass mixed-case EIP-55 checksum checks in ethers
const BEP20_USDT = '0x55d398326f99059ff775485246999027b3197955';
const BEP20_USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const minABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    let invoice = await Invoice.findById(id).populate('merchantId', 'businessName logo website webhookUrl webhookHeaders systemWalletAddress systemWalletPrivateKey merchantWallet');
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    // 0. EXPIRATION CHECK
    if ((invoice.status === 'Pending' || invoice.status === 'Partially Paid') && new Date() > new Date(invoice.expiresAt)) {
      invoice.status = 'Expired';
      await invoice.save();
      await triggerWebhook(invoice);
      return NextResponse.json({ success: true, invoice });
    }

    // Real-time blockchain payment verification
    if (['Pending', 'Processing', 'Partially Paid', 'Overpaid', 'Gas Funding'].includes(invoice.status)) {
      try {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const tokenAddress = (invoice.coin === 'USDC' ? BEP20_USDC : BEP20_USDT).toLowerCase();
        const tokenContract = new ethers.Contract(tokenAddress, minABI, provider);
        
        const balanceWei = await tokenContract.balanceOf(invoice.walletAddress.toLowerCase());
        const coinBalance = parseFloat(ethers.formatUnits(balanceWei, 18));

        if (coinBalance > 0) {
          // 1. AMOUNT DETECTED -> PROCESSING
          if (invoice.status === 'Pending') {
            invoice.status = 'Processing';
            invoice.receivedAmount = coinBalance;
            await invoice.save();
            await triggerWebhook(invoice);
          }

          // Identify sender address from transfer events to support overpayment refunds
          let senderAddress = null;
          try {
            const filter = tokenContract.filters.Transfer(null, invoice.walletAddress.toLowerCase());
            let logs = [];
            try {
              logs = await tokenContract.queryFilter(filter, -500);
            } catch (innerLimitErr) {
              console.warn('RPC limit hit on -500 blocks, retrying with narrow -100 block window...');
              try {
                logs = await tokenContract.queryFilter(filter, -100);
              } catch (fallbackErr) {
                console.error('All RPC log query windows failed:', fallbackErr);
              }
            }

            if (logs && logs.length > 0) {
              const lastLog = logs[logs.length - 1];
              senderAddress = lastLog.args[0];
            }
          } catch (logErr) {
            console.error('Error parsing transfer logs for sender address:', logErr);
          }

          const targetAmount = invoice.usdtAmount;

          // 2. UNDERPAYMENT (Partial Payment)
          if (coinBalance < targetAmount) {
            if (invoice.receivedAmount !== coinBalance || invoice.status !== 'Partially Paid') {
              invoice.status = 'Partially Paid';
              invoice.receivedAmount = coinBalance;
              await invoice.save();
              
              // Notify customer of partial payment and remaining balance
              await sendPartialPaymentEmail(invoice);
              
              await triggerWebhook(invoice);
            }
          } 
          
          // 3. OVERPAYMENT DETECTED
          else if (coinBalance > targetAmount && invoice.status === 'Processing') {
            invoice.status = 'Overpaid';
            invoice.receivedAmount = coinBalance;
            await invoice.save();
            await triggerWebhook(invoice);
          }

          // 4. GAS FUNDING & SWEEP INITIATION (For Exact or Overpaid payments)
          if (coinBalance >= targetAmount && ['Processing', 'Overpaid', 'Partially Paid', 'Gas Funding'].includes(invoice.status)) {
            const merchant = invoice.merchantId;
            if (merchant && merchant.systemWalletPrivateKey && merchant.merchantWallet) {
              const systemWallet = new ethers.Wallet(merchant.systemWalletPrivateKey, provider);
              const tempWallet = new ethers.Wallet(invoice.walletPrivateKey, provider);

              // Update state to Gas Funding
              const priorStatus = invoice.status;
              if (invoice.status !== 'Gas Funding') {
                invoice.status = 'Gas Funding';
                await invoice.save();
                await triggerWebhook(invoice);
              }

              // Determine if we need to refund an overpayment dynamically based on balance
              const isOverpaid = coinBalance > (targetAmount + 0.001);

              // Step A: Send BNB gas to temporary wallet to execute token transfers
              const gasValue = isOverpaid ? "0.0025" : "0.0015";

              // Check if system wallet has enough BNB gas balance first
              const systemBnbBalance = await provider.getBalance(systemWallet.address);
              const requiredGasWei = ethers.parseEther(gasValue);
              if (systemBnbBalance < requiredGasWei) {
                throw new Error(`Insufficient BNB in system gas wallet (${systemWallet.address}). Balance: ${ethers.formatEther(systemBnbBalance)} BNB, Required: ${gasValue} BNB.`);
              }

              const gasTx = await systemWallet.sendTransaction({
                to: tempWallet.address.toLowerCase(),
                value: requiredGasWei
              });
              await gasTx.wait();

              // Step B: Transfer/Sweep
              const tokenWithSigner = tokenContract.connect(tempWallet);

              if (isOverpaid) {
                // Refund overpaid tokens back to the customer's sender address
                if (senderAddress) {
                  const overpaidAmountWei = balanceWei - ethers.parseUnits(targetAmount.toString(), 18);
                  try {
                    const refundTx = await tokenWithSigner.transfer(senderAddress.toLowerCase(), overpaidAmountWei);
                    await refundTx.wait();

                    // Save refund records to database
                    invoice.overpaidDetails = {
                      refundAddress: senderAddress,
                      refundAmount: parseFloat(ethers.formatUnits(overpaidAmountWei, 18)),
                      refundTxHash: refundTx.hash,
                      refundedAt: new Date()
                    };
                    await invoice.save();

                    // Send overpayment notification and refund details email to customer
                    await sendOverpaymentEmail(invoice, ethers.formatUnits(overpaidAmountWei, 18), refundTx.hash);
                  } catch (refundErr) {
                    console.error('Failed to refund overpaid amount to customer:', refundErr);
                  }
                }

                // Transfer exact target amount to merchant receiving wallet
                try {
                  const exactAmountWei = ethers.parseUnits(targetAmount.toString(), 18);
                  const sweepTx = await tokenWithSigner.transfer(merchant.merchantWallet.toLowerCase(), exactAmountWei);
                  await sweepTx.wait();
                  invoice.transactionHash = sweepTx.hash;
                } catch (sweepErr) {
                  console.error('Failed to sweep exact amount to merchant:', sweepErr);
                }
              } else {
                // Exact payment: transfer everything to merchant receiving wallet
                const transferTx = await tokenWithSigner.transfer(merchant.merchantWallet.toLowerCase(), balanceWei);
                await transferTx.wait();
                invoice.transactionHash = transferTx.hash;
              }

              // Step C: Send leftover BNB gas back to merchant system/gas wallet
              const bnbBalanceWei = await provider.getBalance(tempWallet.address.toLowerCase());
              const gasPrice = (await provider.getFeeData()).gasPrice || ethers.parseUnits("3", "gwei");
              const gasLimit = 21000n;
              const txCost = gasLimit * gasPrice;
              if (bnbBalanceWei > txCost) {
                const sendBnbTx = await tempWallet.sendTransaction({
                  to: (merchant.systemWalletAddress || systemWallet.address).toLowerCase(),
                  value: bnbBalanceWei - txCost,
                  gasLimit,
                  gasPrice
                });
                await sendBnbTx.wait();
              }
            }

            // Set final status to Paid
            invoice.status = 'Paid';
            invoice.receivedAmount = coinBalance;
            invoice.paidAt = new Date();
            await invoice.save();
            await triggerWebhook(invoice);
          }
        }
      } catch (blockchainErr) {
        console.error('Failed checking payment balance:', blockchainErr);
      }
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Fetch invoice error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to notify customer of partial payments
async function sendPartialPaymentEmail(invoice) {
  const remaining = (invoice.usdtAmount - (invoice.receivedAmount || 0)).toFixed(2);
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`;
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'OrvixPay';
  const merchant = invoice.merchantId;

  try {
    await sendEmail({
      to: invoice.customerEmail,
      subject: `Partial Payment Received — Order ${invoice.orderId}`,
      html: `
        <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);">
            
            <!-- Top Accent Bar -->
            <div style="height: 6px; background: linear-gradient(90deg, #f59e0b, #d97706);"></div>
            
            <div style="padding: 36px 28px;">
              <!-- Header / Logo -->
              <div style="text-align: center; margin-bottom: 28px;">
                ${merchant.logo 
                  ? `<img src="${merchant.logo}" alt="${merchant.businessName}" style="height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 12px;" />` 
                  : `<div style="width: 48px; height: 48px; background: #fef3c7; color: #d97706; border-radius: 14px; line-height: 48px; font-size: 20px; font-weight: 800; margin: 0 auto 12px; text-align: center;">${(merchant.businessName || 'M').charAt(0).toUpperCase()}</div>`
                }
                <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800; tracking-tight: -0.02em;">${merchant.businessName || 'Merchant'}</h2>
                <p style="margin: 4px 0 0; color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Partial Payment Received</p>
              </div>

              <!-- Divider -->
              <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 24px;"></div>

              <p style="color: #475569; font-size: 13.5px; line-height: 1.5; margin-bottom: 20px; font-weight: 500;">
                We received a partial payment for your invoice. Please send the remaining balance to complete the transaction.
              </p>

              <!-- Payment Stats Card -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; color: #d97706; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Remaining Balance</p>
                <div style="margin-bottom: 16px;">
                  <span style="font-size: 32px; font-weight: 800; color: #b45309; tracking-tight: -0.03em;">${remaining}</span>
                  <span style="font-size: 16px; font-weight: 700; color: #d97706; margin-left: 4px;">${invoice.coin}</span>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #fef3c7; font-weight: 550;">Total Expected</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0;">${invoice.usdtAmount} ${invoice.coin}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #fef3c7; font-weight: 550;">Total Received</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0; color: #d97706;">${invoice.receivedAmount} ${invoice.coin}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; font-weight: 550;">Order ID</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0; font-family: monospace;">${invoice.orderId}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="${paymentUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13.5px; padding: 15px 24px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.3); letter-spacing: 0.5px;">
                  Pay Remaining Balance
                </a>
                <p style="margin: 20px 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; line-height: 1.5;">
                  Please ensure you send the remaining funds using the correct network.<br />
                  Protected and processed via <strong>${appName}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    });
  } catch (emailErr) {
    console.error('Failed to send partial payment email:', emailErr);
  }
}

// Helper to notify customer of overpayments and refund hashes
async function sendOverpaymentEmail(invoice, overpaidAmount, txHash) {
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`;
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'OrvixPay';
  const merchant = invoice.merchantId;
  const bscScanUrl = `https://bscscan.com/tx/${txHash}`;

  try {
    await sendEmail({
      to: invoice.customerEmail,
      subject: `Invoice Paid & Overpayment Refunded — Order ${invoice.orderId}`,
      html: `
        <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);">
            
            <!-- Top Accent Bar -->
            <div style="height: 6px; background: linear-gradient(90deg, #10b981, #059669);"></div>
            
            <div style="padding: 36px 28px;">
              <!-- Header / Logo -->
              <div style="text-align: center; margin-bottom: 28px;">
                ${merchant.logo 
                  ? `<img src="${merchant.logo}" alt="${merchant.businessName}" style="height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 12px;" />` 
                  : `<div style="width: 48px; height: 48px; background: #ecfdf5; color: #059669; border-radius: 14px; line-height: 48px; font-size: 20px; font-weight: 800; margin: 0 auto 12px; text-align: center;">${(merchant.businessName || 'M').charAt(0).toUpperCase()}</div>`
                }
                <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800; tracking-tight: -0.02em;">${merchant.businessName || 'Merchant'}</h2>
                <p style="margin: 4px 0 0; color: #10b981; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Payment Successful</p>
              </div>

              <!-- Divider -->
              <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 24px;"></div>

              <p style="color: #475569; font-size: 13.5px; line-height: 1.5; margin-bottom: 20px; font-weight: 500;">
                Thank you! Your payment of <strong>${invoice.usdtAmount} ${invoice.coin}</strong> has been successfully received and processed.
              </p>

              <div style="background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; color: #059669; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Overpayment Refunded</p>
                <div style="margin-bottom: 16px;">
                  <span style="font-size: 32px; font-weight: 800; color: #047857; tracking-tight: -0.03em;">${overpaidAmount}</span>
                  <span style="font-size: 16px; font-weight: 700; color: #059669; margin-left: 4px;">${invoice.coin}</span>
                </div>
                <p style="margin: 0 0 16px; color: #065f46; font-size: 12.5px; line-height: 1.4; font-weight: 500;">
                  You sent more than the required amount. The extra funds shown above have been sent back to your sending wallet.
                </p>

                <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #d1fae5; font-weight: 550;">Invoice Cost</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0;">${invoice.usdtAmount} ${invoice.coin}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #d1fae5; font-weight: 550;">Total Paid</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0;">${invoice.receivedAmount} ${invoice.coin}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; padding: 6px 0; font-weight: 550;">Refund Tx Hash</td>
                    <td style="text-align: right; padding: 6px 0;">
                      <a href="${bscScanUrl}" target="_blank" style="color: #10b981; font-weight: 700; text-decoration: underline; font-family: monospace;">
                        ${txHash.slice(0, 6)}...${txHash.slice(-6)}
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action Button -->
              <div style="text-align: center;">
                <a href="${paymentUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13.5px; padding: 15px 24px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3); letter-spacing: 0.5px;">
                  View Invoice Details
                </a>
                <p style="margin: 20px 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; line-height: 1.5;">
                  If you have any questions, please contact the merchant directly.<br />
                  Secured and processed via <strong>${appName}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    });
  } catch (emailErr) {
    console.error('Failed to send overpayment email:', emailErr);
  }
}


