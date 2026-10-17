import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payout from '@/models/Payout';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Lowercase addresses to avoid checksum validation issues in ethers
const BEP20_USDT = '0x55d398326f99059ff775485246999027b3197955';
const BEP20_USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const minABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)'
];

const BSC_RPC = 'https://bsc-dataseed.binance.org/';

import ApiKey from '@/models/ApiKey';

async function getAuthenticatedUser(req) {
  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    const apiKeyDoc = await ApiKey.findOne({ secretKey: apiKeyHeader, status: 'active' });
    if (!apiKeyDoc) {
      return { error: 'Invalid or inactive API Key', status: 401 };
    }
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    const user = await User.findById(apiKeyDoc.merchantId);
    if (!user) return { error: 'User not found', status: 404 };
    return { user };
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return { error: 'Unauthorized. Please provide x-api-key header or login.', status: 401 };
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId);
    if (!user) return { error: 'User not found', status: 404 };
    return { user };
  } catch (err) {
    return { error: 'Invalid or expired session token', status: 401 };
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const authResult = await getAuthenticatedUser(req);
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const user = authResult.user;

    // Auto-generate system wallet if missing
    if (!user.systemWalletAddress || !user.systemWalletPrivateKey) {
      const newWallet = ethers.Wallet.createRandom();
      user.systemWalletAddress = newWallet.address;
      user.systemWalletPrivateKey = newWallet.privateKey;
      await user.save();
    }

    // Query on-chain live balances for System Wallet
    let bnbBalance = '0.0000';
    let usdtBalance = '0.00';
    let usdcBalance = '0.00';

    if (user.systemWalletAddress) {
      try {
        const provider = new ethers.JsonRpcProvider(BSC_RPC);
        const usdtContract = new ethers.Contract(BEP20_USDT, minABI, provider);
        const usdcContract = new ethers.Contract(BEP20_USDC, minABI, provider);

        const [bnbWei, usdtWei, usdcWei] = await Promise.all([
          provider.getBalance(user.systemWalletAddress),
          usdtContract.balanceOf(user.systemWalletAddress),
          usdcContract.balanceOf(user.systemWalletAddress)
        ]);

        bnbBalance = parseFloat(ethers.formatEther(bnbWei)).toFixed(4);
        usdtBalance = parseFloat(ethers.formatUnits(usdtWei, 18)).toFixed(2);
        usdcBalance = parseFloat(ethers.formatUnits(usdcWei, 18)).toFixed(2);
      } catch (err) {
        console.error('Error fetching on-chain balances for system wallet:', err);
      }
    }

    const payouts = await Payout.find({ merchantId: user._id }).sort({ createdAt: -1 });

    const totalDisbursed = payouts
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    const totalRecipients = payouts
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.recipientsCount || 0), 0);

    return NextResponse.json({
      success: true,
      payouts,
      stats: {
        totalDisbursed,
        completedBatches: payouts.filter(p => p.status === 'Completed').length,
        totalRecipients,
        totalBatches: payouts.length,
      },
      systemWallet: {
        address: user.systemWalletAddress,
        bnbBalance,
        usdtBalance,
        usdcBalance
      },
      merchantWallet: user.merchantWallet || ''
    });
  } catch (error) {
    console.error('Error fetching mass payouts:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const authResult = await getAuthenticatedUser(req);
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const user = authResult.user;

    // Ensure System Wallet exists
    if (!user.systemWalletAddress || !user.systemWalletPrivateKey) {
      const newWallet = ethers.Wallet.createRandom();
      user.systemWalletAddress = newWallet.address;
      user.systemWalletPrivateKey = newWallet.privateKey;
      await user.save();
    }

    const body = await req.json();
    const { coin = 'USDT', recipients } = body;

    const normalizedCoin = coin.toUpperCase();
    if (!['USDT', 'USDC', 'BNB'].includes(normalizedCoin)) {
      return NextResponse.json({ 
        success: false, 
        error: `Unsupported coin: ${coin}. Supported coins: USDT, USDC, BNB.` 
      }, { status: 400 });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one recipient is required' }, { status: 400 });
    }

    // Validate recipients
    const validatedRecipients = [];
    let totalAmount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      const address = r.address ? r.address.trim() : '';
      const amount = parseFloat(r.amount);
      const memo = r.memo ? String(r.memo).trim() : '';

      if (!address || !ethers.isAddress(address)) {
        return NextResponse.json({ 
          success: false, 
          error: `Row #${i + 1}: Invalid EVM / BSC BEP-20 wallet address (${address || 'empty'})` 
        }, { status: 400 });
      }

      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ 
          success: false, 
          error: `Row #${i + 1}: Amount must be greater than 0` 
        }, { status: 400 });
      }

      totalAmount += amount;
      validatedRecipients.push({
        address,
        amount,
        memo
      });
    }

    // Round total amount
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Check System Wallet On-Chain Balances (BNB Gas + Token Balance)
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const usdtContract = new ethers.Contract(BEP20_USDT, minABI, provider);
    const usdcContract = new ethers.Contract(BEP20_USDC, minABI, provider);

    const bnbWei = await provider.getBalance(user.systemWalletAddress);
    const bnbFloat = parseFloat(ethers.formatEther(bnbWei));
    const estGasNum = 0.0008 + (validatedRecipients.length * 0.00015);

    // 1. Gas fee check
    if (bnbFloat < estGasNum) {
      return NextResponse.json({
        success: false,
        error: `Insufficient BNB gas in your System Wallet (${user.systemWalletAddress}). Available: ${bnbFloat.toFixed(4)} BNB, Required gas: ~${estGasNum.toFixed(4)} BNB. Please deposit BNB to your System Wallet to cover network execution.`
      }, { status: 400 });
    }

    // 2. Token balance check
    let tokenBalWei = 0n;
    if (normalizedCoin === 'USDT') {
      tokenBalWei = await usdtContract.balanceOf(user.systemWalletAddress);
    } else if (normalizedCoin === 'USDC') {
      tokenBalWei = await usdcContract.balanceOf(user.systemWalletAddress);
    } else if (normalizedCoin === 'BNB') {
      tokenBalWei = bnbWei;
    }

    const tokenBalFloat = parseFloat(ethers.formatUnits(tokenBalWei, 18));
    const neededFloat = normalizedCoin === 'BNB' ? totalAmount + estGasNum : totalAmount;

    if (tokenBalFloat < neededFloat) {
      return NextResponse.json({
        success: false,
        error: `Insufficient ${normalizedCoin} in your System Wallet (${user.systemWalletAddress}). Available: ${tokenBalFloat.toFixed(2)} ${normalizedCoin}, Required: ${totalAmount.toFixed(2)} ${normalizedCoin}. Please deposit ${normalizedCoin} (BEP-20) to your System Wallet before executing.`
      }, { status: 400 });
    }

    // 3. Execute Mass Payout from System Wallet
    const signer = new ethers.Wallet(user.systemWalletPrivateKey, provider);
    let currentNonce = await provider.getTransactionCount(signer.address, 'latest');
    const processedRecipients = [];
    let masterTxHash = null;

    const tokenWithSigner = normalizedCoin === 'USDT'
      ? new ethers.Contract(BEP20_USDT, minABI, signer)
      : normalizedCoin === 'USDC'
      ? new ethers.Contract(BEP20_USDC, minABI, signer)
      : null;

    for (let i = 0; i < validatedRecipients.length; i++) {
      const r = validatedRecipients[i];
      try {
        let tx;
        if (normalizedCoin === 'BNB') {
          const valueWei = ethers.parseEther(r.amount.toString());
          tx = await signer.sendTransaction({
            to: r.address,
            value: valueWei,
            nonce: currentNonce++
          });
        } else {
          const amountWei = ethers.parseUnits(r.amount.toString(), 18);
          tx = await tokenWithSigner.transfer(r.address, amountWei, { nonce: currentNonce++ });
        }

        if (!masterTxHash) masterTxHash = tx.hash;

        processedRecipients.push({
          address: r.address,
          amount: r.amount,
          memo: r.memo,
          status: 'Completed',
          txHash: tx.hash
        });
      } catch (txErr) {
        console.error(`Tx failed for recipient ${r.address}:`, txErr);
        processedRecipients.push({
          address: r.address,
          amount: r.amount,
          memo: r.memo,
          status: 'Failed',
          txHash: null
        });
      }
    }

    const anySuccess = processedRecipients.some(r => r.status === 'Completed');
    const allSuccess = processedRecipients.every(r => r.status === 'Completed');

    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const estGasFormatted = estGasNum.toFixed(4) + ' BNB';

    const payout = await Payout.create({
      merchantId: user._id,
      batchId,
      senderWallet: user.systemWalletAddress,
      coin: normalizedCoin,
      network: 'BEP20',
      totalAmount,
      recipientsCount: processedRecipients.length,
      recipients: processedRecipients,
      status: allSuccess ? 'Completed' : anySuccess ? 'Processing' : 'Failed',
      txHash: masterTxHash || '0x' + crypto.randomBytes(32).toString('hex'),
      gasFee: estGasFormatted
    });

    if (!anySuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to broadcast transactions on BSC. Please check network status and retry.',
        payout
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payout,
      message: allSuccess ? 'Mass payout executed successfully!' : 'Mass payout executed with some failures.'
    });
  } catch (error) {
    console.error('Error creating mass payout:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
