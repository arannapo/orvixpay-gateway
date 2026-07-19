import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Re-verify credentials before sending OTP
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: '2FA is not enabled on this account' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      emailOtp: otp,
      emailOtpExpires: expiresAt
    });

    console.log(`\n===============================================\n[AUTH] Generated 2FA OTP for user ${user.email}: ${otp}\n===============================================\n`);

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'CryptoSaaS';

    await sendEmail({
      to: user.email,
      subject: `${appName} — Your Login Verification Code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.PNG" alt="${appName}" style="height: 40px; margin-bottom: 16px; object-fit: contain;" />
            <p style="margin: 6px 0 0; color: #64748b; font-size: 14px; font-weight: 500;">Login Verification Code</p>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Use the code below to complete your sign-in. This code is valid for <strong>10 minutes</strong> and can only be used once.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; text-align: center; margin: 0 0 24px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
            <p style="margin: 0; font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: 12px; font-family: monospace;">${otp}</p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
            If you didn't request this code, please ignore this email. Your account remains secure.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: `Verification code sent to ${user.email}` });

  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send verification email' }, { status: 500 });
  }
}
