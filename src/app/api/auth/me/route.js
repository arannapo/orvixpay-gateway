import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const decoded = jwt.verify(token, secret);
    return NextResponse.json({ authenticated: true, user: { userId: decoded.userId, role: decoded.role } });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
