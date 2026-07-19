import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    user.emailOtp = otp;
    user.emailOtpExpires = expiresAt;
    await user.save();

    // Send email
    const subject = 'Your Security Verification Code';
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.PNG" alt="ORVIXPAY" style="height: 40px; object-fit: contain;" />
        </div>
        <h2 style="color: #0f172a; text-align: center; margin-top: 0;">Security Verification Code</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested a verification code to modify your security settings. Please use the following code to confirm your request:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 5px; color: #0f172a; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 11px; text-align: center;">This code will expire in 5 minutes. If you did not request this code, please ignore this email or secure your account.</p>
      </div>
    `;

    const mailResult = await sendEmail({ to: user.email, subject, html });
    if (!mailResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      previewUrl: mailResult.previewUrl 
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
