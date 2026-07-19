import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    const merchantId = decoded.userId;

    const invoices = await Invoice.find({ merchantId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Invoice List Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
