import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await dbConnect();

    // Get merchant ID from token
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    const merchantId = decoded.userId;

    const { name } = await req.json();
    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Key name is required' }, { status: 400 });
    }

    const existingKey = await ApiKey.findOne({ merchantId, name: name.trim() });
    if (existingKey) {
      return NextResponse.json({ success: false, error: 'An API key with this name already exists' }, { status: 400 });
    }

    // Generate custom secret key with uppercase, lowercase, numbers, - and _ mixed
    const generateRandomKey = (length = 96) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let result = '';
      const randomValues = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
      }
      return result;
    };

    const secretKey = generateRandomKey(96);

    const apiKey = await ApiKey.create({
      merchantId,
      name: name.trim(),
      secretKey,
      status: 'active'
    });

    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    console.error('API Key Generation Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
