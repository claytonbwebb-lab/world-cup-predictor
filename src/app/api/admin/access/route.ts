import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ALLOWED_ADMINS = ['brightstacklabs@gmail.com'];

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  if (!ALLOWED_ADMINS.includes(email?.toLowerCase())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const adminSecret = process.env.ADMIN_SECRET || 'your_secure_admin_secret_here';
  
  const cookieStore = await cookies();
  cookieStore.set('admin_secret', adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return NextResponse.json({ success: true });
}
