import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ success: false, error: 'Email, code, and password are required' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character' 
      }, { status: 400 });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset OTP code' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
