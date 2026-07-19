import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const conditions = [
        { transactionHash: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } }
      ];
      
      if (mongoose.Types.ObjectId.isValid(search)) {
        conditions.push({ _id: search });
      }
      
      query.$or = conditions;
    }

    const invoices = await Invoice.find(query)
      .populate('merchantId', 'businessName logo email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Fetch all invoices admin error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
