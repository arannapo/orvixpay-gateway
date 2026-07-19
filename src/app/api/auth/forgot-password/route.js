import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'No account associated with this email address' }, { status: 404 });
    }

    // Generate 6-digit OTP code for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    console.log(`\n===============================================\n[PASSWORD RESET] Generated OTP for user ${email}: ${otp}\n===============================================\n`);

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'OrvixPay';
    const emailSubject = `[${appName}] Reset Password OTP`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
        <p>A password reset request was initiated for your ${appName} account.</p>
        <p>Use the following 6-digit verification code to complete the reset. This code is valid for 15 minutes:</p>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; border: 1px solid #e2e8f0; color: #1e293b;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    `;

    const mailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml
    });

    if (!mailResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
