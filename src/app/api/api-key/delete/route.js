import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();

    // Get merchant ID from token
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    const merchantId = decoded.userId;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing key ID' }, { status: 400 });
    }

    const deletedKey = await ApiKey.findOneAndDelete({ _id: id, merchantId });

    if (!deletedKey) {
      return NextResponse.json({ success: false, error: 'API key not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    console.error('API Key Deletion Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
