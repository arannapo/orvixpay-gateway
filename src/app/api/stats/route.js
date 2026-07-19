import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import ApiKey from '@/models/ApiKey';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

export async function GET(req) {
  try {
    await dbConnect();

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    const merchantId = decoded.userId;

    const invoices = await Invoice.find({ merchantId }).sort({ createdAt: -1 });
    const apiKeys = await ApiKey.countDocuments({ merchantId });

    // Compute stats
    let totalRevenue = 0;
    let paidInvoices = 0;
    let pendingInvoices = 0;

    invoices.forEach(inv => {
      if (inv.status === 'Paid' || inv.status === 'Overpaid') {
        totalRevenue += inv.amount;
        paidInvoices++;
      } else if (['Pending', 'Processing', 'Partially Paid', 'Gas Funding'].includes(inv.status)) {
        pendingInvoices++;
      }
    });

    const recentInvoices = invoices.slice(0, 5); // top 5 recent

    // Fetch System Wallet Balance
    const user = await User.findById(merchantId);
    const systemWalletAddress = user?.systemWalletAddress || null;
    let systemWalletBalance = '0.0000';

    if (systemWalletAddress) {
      try {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const balanceWei = await provider.getBalance(systemWalletAddress);
        // Format down to 4 decimal places for UI
        systemWalletBalance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
      } catch (error) {
        console.error('Error fetching BNB balance:', error);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        paidInvoices,
        pendingInvoices,
        apiRequests: apiKeys, // simplified for dashboard
        systemWalletAddress,
        systemWalletBalance
      },
      recentInvoices
    });
  } catch (error) {
    console.error('Stats Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
