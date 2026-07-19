import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import jwt from 'jsonwebtoken';

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

// GET all merchants
export async function GET() {
  try {
    await dbConnect();
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const merchants = await User.find({ role: 'merchant' }).sort({ createdAt: -1 });

    // Aggregate invoice counts for each merchant
    const merchantsWithStats = await Promise.all(merchants.map(async (m) => {
      const invoiceCount = await Invoice.countDocuments({ merchantId: m._id });
      const paidInvoices = await Invoice.find({ merchantId: m._id, status: { $in: ['Paid', 'Overpaid'] } });
      const volume = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      return {
        _id: m._id,
        email: m.email,
        businessName: m.businessName || 'No Name',
        website: m.website || '',
        logo: m.logo || '',
        merchantWallet: m.merchantWallet || '',
        systemWalletAddress: m.systemWalletAddress || '',
        isEmailVerified: m.isEmailVerified,
        isBlocked: m.isBlocked || false,
        createdAt: m.createdAt,
        invoiceCount,
        volume
      };
    }));

    return NextResponse.json({ success: true, merchants: merchantsWithStats });
  } catch (error) {
    console.error('Fetch merchants admin error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update merchant state (Block/Unblock or Update Details)
export async function PUT(req) {
  try {
    await dbConnect();
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, isBlocked, businessName, website } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ success: false, error: 'Merchant ID is required' }, { status: 400 });
    }

    const merchant = await User.findById(merchantId);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }

    if (isBlocked !== undefined) {
      merchant.isBlocked = isBlocked;
    }
    if (businessName !== undefined) {
      merchant.businessName = businessName;
    }
    if (website !== undefined) {
      merchant.website = website;
    }

    merchant.updatedAt = new Date();
    await merchant.save();

    return NextResponse.json({ success: true, message: 'Merchant updated successfully', merchant });
  } catch (error) {
    console.error('Update merchant admin error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
