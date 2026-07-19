import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();

    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    const merchantId = decoded.userId;

    const apiKeys = await ApiKey.find({ merchantId }).sort({ createdAt: -1 });
    const maskedApiKeys = apiKeys.map(key => {
      const secret = key.secretKey;
      const last4 = secret.substring(secret.length - 4);
      const masked = `••••••••••••••••••••••••••••${last4}`;
      return {
        _id: key._id,
        name: key.name,
        secretKey: masked,
        status: key.status,
        createdAt: key.createdAt
      };
    });

    return NextResponse.json({ success: true, apiKeys: maskedApiKeys });
  } catch (error) {
    console.error('API Key Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
