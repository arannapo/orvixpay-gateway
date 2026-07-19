import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/mail';
import { triggerWebhook } from '@/lib/webhooks';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { amount, currency, coin, orderId, customerName, customerEmail, description, webhook, successUrl, cancelUrl, metadata } = body;

    // Validate request
    if (!amount || !currency || !orderId || !coin || !customerEmail) {
      return NextResponse.json({ success: false, error: 'Missing required fields (amount, currency, orderId, coin, and customerEmail are required)' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid customer email address format' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number greater than zero' }, { status: 400 });
    }

    // Validate Coin (Only USDT or USDC BEP20 allowed)
    if (coin !== 'USDT' && coin !== 'USDC') {
      return NextResponse.json({ success: false, error: 'Invalid coin. Only USDT or USDC are supported' }, { status: 400 });
    }
    const selectedCoin = coin;

    // Check for API Key first, fallback to Cookie token
    const apiKeyHeader = req.headers.get('x-api-key');
    let merchantId = null;

    if (apiKeyHeader) {
      // Import ApiKey model dynamically or statically at top
      const ApiKey = (await import('@/models/ApiKey')).default;
      const apiKeyDoc = await ApiKey.findOne({ secretKey: apiKeyHeader, status: 'active' });
      if (!apiKeyDoc) {
        return NextResponse.json({ success: false, error: 'Invalid or inactive API Key' }, { status: 401 });
      }
      merchantId = apiKeyDoc.merchantId;
      
      // Update last used timestamp
      apiKeyDoc.lastUsed = new Date();
      await apiKeyDoc.save();
    } else {
      const token = req.cookies.get('token')?.value;
      if (!token) return NextResponse.json({ success: false, error: 'Unauthorized. Please provide x-api-key header or login.' }, { status: 401 });
      
      const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
      const decoded = jwt.verify(token, secret);
      merchantId = decoded.userId;
    }

    // Fetch Merchant Profile to validate settings and gas
    const merchant = await User.findById(merchantId);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant account not found' }, { status: 404 });
    }

    if (!merchant.merchantWallet) {
      return NextResponse.json({ success: false, error: 'Please set your Receiving Wallet in Settings before creating invoices' }, { status: 400 });
    }
    
    if (!merchant.logo) {
      return NextResponse.json({ success: false, error: 'Please upload a Business Logo in Settings before creating invoices' }, { status: 400 });
    }

    if (!merchant.businessName) {
      return NextResponse.json({ success: false, error: 'Please configure your Business Name in Settings before creating invoices' }, { status: 400 });
    }


    if (!merchant.systemWalletAddress) {
      return NextResponse.json({ success: false, error: 'System gas wallet missing. Please contact support' }, { status: 400 });
    }

    // Verify System Gas Wallet has gas to cover transaction sweep fees
    try {
      const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      const balanceWei = await provider.getBalance(merchant.systemWalletAddress);
      const bnbBalance = parseFloat(ethers.formatEther(balanceWei));

      if (bnbBalance <= 0) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient gas. Please deposit BNB into your System Gas Wallet (Current: ${bnbBalance.toFixed(4)} BNB) to cover blockchain sweep fees.` 
        }, { status: 400 });
      }
    } catch (err) {
      console.error('Failed to verify gas balance:', err);
      return NextResponse.json({ success: false, error: 'Failed to connect to blockchain to verify gas balance. Please try again.' }, { status: 500 });
    }

    // Generate a random wallet address for this invoice (In production, derive from a master seed / HD Wallet)
    const wallet = ethers.Wallet.createRandom();
    const paymentAddress = wallet.address;
    const paymentPrivateKey = wallet.privateKey;
    
    // In a real app, you'd fetch live exchange rates. Using a mock 1:1 for USD to USDT
    const usdtAmount = amount; 
    
    // Expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const invoice = await Invoice.create({
      merchantId,
      orderId,
      customerName,
      customerEmail,
      description,
      amount,
      currency,
      usdtAmount,
      walletAddress: paymentAddress,
      walletPrivateKey: paymentPrivateKey,
      network: 'BEP20',
      coin: selectedCoin,
      webhookUrl: webhook,
      successUrl,
      cancelUrl,
      expiresAt,
      metadata: (metadata && typeof metadata === 'object') ? metadata : {}
    });

    // Trigger webhook for initial Pending status
    invoice.merchantId = merchant;
    await triggerWebhook(invoice);

    // Send invoice details to customer email
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`;
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'OrvixPay';

    try {
      await sendEmail({
        to: customerEmail,
        subject: `Invoice from ${merchant.businessName || 'Merchant'} — Order ${orderId}`,
        html: `
          <div style="background-color: #f8fafc; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);">
              
              <!-- Top Accent Bar -->
              <div style="height: 6px; background: linear-gradient(90deg, #6366f1, #a855f7);"></div>
              
              <div style="padding: 36px 28px;">
                <!-- Header / Logo -->
                <div style="text-align: center; margin-bottom: 28px;">
                  ${merchant.logo 
                    ? `<img src="${merchant.logo}" alt="${merchant.businessName}" style="height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 12px;" />` 
                    : `<div style="width: 48px; height: 48px; background: #f3e8ff; color: #7c3aed; border-radius: 14px; line-height: 48px; font-size: 20px; font-weight: 800; margin: 0 auto 12px; text-align: center;">${(merchant.businessName || 'M').charAt(0).toUpperCase()}</div>`
                  }
                  <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800; tracking-tight: -0.02em;">${merchant.businessName || 'Merchant'}</h2>
                  <p style="margin: 4px 0 0; color: #64748b; font-size: 11px; font-weight: 750; text-transform: uppercase; letter-spacing: 1px;">Payment Request</p>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 24px;"></div>

                <!-- Main Receipt Card -->
                <div style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
                  <p style="margin: 0 0 4px; color: #7c3aed; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
                  <div style="margin-bottom: 16px;">
                    <span style="font-size: 32px; font-weight: 800; color: #0f172a; tracking-tight: -0.03em;">${amount}</span>
                    <span style="font-size: 16px; font-weight: 700; color: #64748b; margin-left: 4px;">${currency}</span>
                  </div>

                  <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #f3e8ff; font-weight: 550;">Order ID</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0; font-family: monospace;">${orderId}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #f3e8ff; font-weight: 550;">Token Network</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0;">BNB Smart Chain (BEP20)</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 6px 0; font-weight: 550;">Accepted Tokens</td>
                      <td style="text-align: right; color: #0f172a; font-weight: 700; padding: 6px 0;">USDT / USDC</td>
                    </tr>
                  </table>
                </div>

                <!-- Description Block -->
                ${description ? `
                <div style="margin-bottom: 28px; padding: 0 4px;">
                  <span style="color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Payment Description</span>
                  <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.5; font-weight: 500;">${description}</p>
                </div>
                ` : ''}

                <!-- Action Button -->
                <div style="text-align: center;">
                  <a href="${paymentUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #6366f1, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13.5px; padding: 15px 24px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.3); letter-spacing: 0.5px;">
                    Proceed to Secure Payment
                  </a>
                  <p style="margin: 20px 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; line-height: 1.5;">
                    This secure payment request will expire in 30 minutes.<br />
                    Protected and processed via <strong>${appName}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send invoice email to customer:', emailErr);
    }

    return NextResponse.json({
      success: true,
      invoiceId: invoice._id,
      paymentAddress,
      network: 'BEP20',
      coin: selectedCoin,
      amount: usdtAmount,
      expiresAt,
      paymentUrl
    });

  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
