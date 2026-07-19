import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyTOTP } from '@/lib/totp';
import { sendEmail } from '@/lib/mail';

async function generateAndSendEmailOtp(user) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await User.findByIdAndUpdate(user._id, {
    emailOtp: otp,
    emailOtpExpires: expiresAt
  });

  console.log(`\n===============================================\n[AUTH] Generated OTP for user ${user.email}: ${otp}\n===============================================\n`);

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

  return otp;
}

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password, code } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Automatically migrate existing verified users who do not have the isEmailVerified field yet
    await User.updateMany({ isEmailVerified: { $exists: false } }, { $set: { isEmailVerified: true } });

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isEmailVerified === false) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      // Generate 6-digit OTP code for registration verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.emailOtp = otp;
      user.emailOtpExpires = expiresAt;
      await user.save();

      console.log(`\n===============================================\n[REGISTER OTP TRIGGER] Generated OTP for user ${email}: ${otp}\n===============================================\n`);

      const appName = process.env.NEXT_PUBLIC_APP_NAME || 'OrvixPay';
      await sendEmail({
        to: user.email,
        subject: `${appName} — Confirm Your Registration`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Email Verification</h2>
            <p>Please use the following 6-digit verification code to complete your registration:</p>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; border: 1px solid #e2e8f0; color: #1e293b;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes.</p>
          </div>
        `
      });

      return NextResponse.json({ success: false, error: 'email_not_verified', email: user.email }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // ── TOTP 2FA is enabled ───────────────────────────────────────────────────
    if (user.twoFactorEnabled) {
      if (!code) {
        return NextResponse.json({ success: true, twoFactorRequired: true });
      }

      let verified = false;

      if (code.length === 6) {
        // Try authenticator TOTP first
        verified = verifyTOTP(user.twoFactorSecret, code);

        // Fallback: check email OTP (sent via "use email instead" button)
        if (!verified && user.emailOtp && user.emailOtpExpires) {
          const notExpired = new Date() < new Date(user.emailOtpExpires);
          if (notExpired && user.emailOtp === code) {
            verified = true;
            await User.findByIdAndUpdate(user._id, { emailOtp: null, emailOtpExpires: null });
          }
        }
      }

      if (!verified) {
        return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
      }
    }

    // ── No 2FA — require email OTP for all logins ─────────────────────────────
    else {
      if (!code) {
        // First pass: send OTP to email and ask for it
        try {
          await generateAndSendEmailOtp(user);
        } catch (emailErr) {
          console.error('Failed to send login OTP email:', emailErr);
          return NextResponse.json({ success: false, error: 'Failed to send verification email. Please try again.' }, { status: 500 });
        }
        return NextResponse.json({ success: true, emailOtpRequired: true });
      }

      // Second pass: validate the email OTP
      if (!user.emailOtp || !user.emailOtpExpires) {
        return NextResponse.json({ success: false, error: 'No verification code found. Please try logging in again.' }, { status: 400 });
      }

      const notExpired = new Date() < new Date(user.emailOtpExpires);
      if (!notExpired || user.emailOtp !== code) {
        return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
      }

      // Valid — clear OTP (one-time use)
      await User.findByIdAndUpdate(user._id, { emailOtp: null, emailOtpExpires: null });
    }

    // ── Issue session JWT ─────────────────────────────────────────────────────
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
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
