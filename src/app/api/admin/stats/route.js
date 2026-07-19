import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await dbConnect();
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Platform-wide counts
    const totalInvoices = await Invoice.countDocuments();
    const totalMerchants = await User.countDocuments({ role: 'merchant' });
    const activeMerchants = await User.countDocuments({ role: 'merchant', isEmailVerified: true });

    // Calculate total volume processed (Paid/Overpaid invoices)
    const paidInvoices = await Invoice.find({ status: { $in: ['Paid', 'Overpaid'] } });
    const totalVolume = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Get 5 most recent invoices across all merchants
    const recentInvoices = await Invoice.find()
      .populate('merchantId', 'businessName logo website email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get aggregate gas wallet balance (sample up to 5 merchants to show a realistic combined platform pool)
    const sampleMerchants = await User.find({ role: 'merchant', systemWalletAddress: { $exists: true, $ne: null } }).limit(5);
    let platformGasReserve = 0;
    try {
      const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      for (const merchant of sampleMerchants) {
        if (merchant.systemWalletAddress) {
          const balanceWei = await provider.getBalance(merchant.systemWalletAddress);
          platformGasReserve += parseFloat(ethers.formatEther(balanceWei));
        }
      }
    } catch (rpcError) {
      console.error('Error fetching admin stats BNB balances:', rpcError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalVolume,
        totalInvoices,
        totalMerchants,
        activeMerchants,
        platformGasReserve: platformGasReserve.toFixed(4)
      },
      recentInvoices
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
