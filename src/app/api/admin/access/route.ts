import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ALLOWED_ADMINS = ['brightstacklabs@gmail.com'];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMINS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const adminSecret = process.env.ADMIN_SECRET || 'your_secure_admin_secret_here';
  const cookieStore = await cookies();
  cookieStore.set('admin_secret', adminSecret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return NextResponse.redirect(new URL('/admin', request.url));
}
