import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyTOTP } from '@/lib/totp';

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secretKey = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secretKey);
    
    const { secret, code } = await req.json();
    if (!secret || !code) {
      return NextResponse.json({ success: false, error: 'Secret and code are required' }, { status: 400 });
    }

    const isValid = verifyTOTP(secret, code);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // Save 2FA to User record
    await User.findByIdAndUpdate(decoded.userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying 2FA OTP:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
