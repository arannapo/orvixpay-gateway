import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.userId).select('-password');
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    
    const body = await req.json();
    const { webhookUrl, webhookHeaders, successUrl, cancelUrl, merchantWallet, logo, password, businessName, website, email, twoFactorEnabled, twoFactorSecret, code } = body;

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const isWalletChange = typeof merchantWallet !== 'undefined' && merchantWallet.trim() !== (user.merchantWallet || '');
    const isSensitiveChange = email || password || isWalletChange;
    if (isSensitiveChange) {
      if (!code) {
        return NextResponse.json({ success: false, error: 'Security verification code is required' }, { status: 400 });
      }
      if (!user.emailOtp || !user.emailOtpExpires || user.emailOtp !== code || new Date() > user.emailOtpExpires) {
        return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
      }
      // Code is valid, clear it
      user.emailOtp = undefined;
      user.emailOtpExpires = undefined;
      await user.save();
    }

    // Only include fields that were explicitly sent in the request
    const updateData = {};
    if (typeof webhookUrl !== 'undefined') updateData.webhookUrl = webhookUrl;
    if (typeof webhookHeaders !== 'undefined') {
      updateData.webhookHeaders = Array.isArray(webhookHeaders) 
        ? webhookHeaders.filter(h => h.key && h.key.trim() !== '')
        : [];
    }
    if (typeof successUrl !== 'undefined') updateData.successUrl = successUrl;
    if (typeof cancelUrl !== 'undefined') updateData.cancelUrl = cancelUrl;
    
    if (typeof merchantWallet !== 'undefined') {
      if (merchantWallet && merchantWallet.trim() !== '') {
        if (!ethers.isAddress(merchantWallet.trim())) {
          return NextResponse.json({ success: false, error: 'Invalid EVM/Ethereum receiving wallet address' }, { status: 400 });
        }
        updateData.merchantWallet = merchantWallet.trim();
      } else {
        updateData.merchantWallet = '';
      }
    }

    if (typeof logo !== 'undefined') updateData.logo = logo;
    if (typeof businessName !== 'undefined') updateData.businessName = businessName;
    if (typeof website !== 'undefined') updateData.website = website;

    if (email && email.trim() !== '') {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: decoded.userId } });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Email is already in use' }, { status: 400 });
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (typeof twoFactorEnabled !== 'undefined') {
      updateData.twoFactorEnabled = twoFactorEnabled;
      // When disabling 2FA, also clear the secret and any pending email OTPs
      if (twoFactorEnabled === false) {
        updateData.twoFactorSecret = '';
        updateData.emailOtp = null;
        updateData.emailOtpExpires = null;
      }
    }
    if (typeof twoFactorSecret !== 'undefined' && twoFactorSecret !== null && twoFactorEnabled !== false) {
      updateData.twoFactorSecret = twoFactorSecret;
    }

    if (password && password.trim() !== '') {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return NextResponse.json({ success: false, error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character' }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await User.findByIdAndUpdate(decoded.userId, updateData);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
