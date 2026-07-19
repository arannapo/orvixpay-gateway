import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and verification code are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Registration session not found' }, { status: 400 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ success: false, error: 'Email already verified. Please login.' }, { status: 400 });
    }

    const notExpired = new Date() < new Date(user.emailOtpExpires);
    if (!notExpired || user.emailOtp !== code.trim()) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Auto-generate a dedicated System/Gas wallet for this merchant if they don't have one
    let systemWalletAddress = user.systemWalletAddress;
    let systemWalletPrivateKey = user.systemWalletPrivateKey;

    if (!systemWalletAddress) {
      const wallet = ethers.Wallet.createRandom();
      systemWalletAddress = wallet.address;
      systemWalletPrivateKey = wallet.privateKey;
    }

    // Update user to verified and configure gas wallet
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    user.systemWalletAddress = systemWalletAddress;
    user.systemWalletPrivateKey = systemWalletPrivateKey;
    await user.save();

    // Issue session JWT for direct login
    const payload = { userId: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration verification error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
