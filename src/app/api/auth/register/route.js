import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password, businessName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character' 
      }, { status: 400 });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // If they exist and are already verified, reject registration
    if (existingUser && existingUser.isEmailVerified) {
      return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      // Update unverified user details and generate new OTP
      existingUser.password = hashedPassword;
      existingUser.businessName = businessName || '';
      existingUser.emailOtp = otp;
      existingUser.emailOtpExpires = expiresAt;
      await existingUser.save();
    } else {
      // Create new unverified user
      await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        businessName: businessName || '',
        emailOtp: otp,
        emailOtpExpires: expiresAt,
        isEmailVerified: false
      });
    }

    console.log(`\n===============================================\n[REGISTER] Generated OTP for user ${email}: ${otp}\n===============================================\n`);

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'CryptoSaaS';

    // Send verification email
    await sendEmail({
      to: email,
      subject: `${appName} — Verify Your Email Address`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.PNG" alt="${appName}" style="height: 40px; margin-bottom: 16px; object-fit: contain;" />
            <p style="margin: 6px 0 0; color: #64748b; font-size: 14px; font-weight: 500;">Email Verification</p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Thank you for registering. Use the verification code below to verify your email and complete your account creation.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; text-align: center; margin: 0 0 24px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
            <p style="margin: 0; font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: 12px; font-family: monospace;">${otp}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
            This code is valid for 10 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true, emailOtpRequired: true });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
