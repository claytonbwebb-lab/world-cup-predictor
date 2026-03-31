import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    redirect('/auth/login?error=auth_failed');
  }

  // Set the auth cookie
  cookieStore.set('sb-access-token', data.session.access_token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  cookieStore.set('sb-refresh-token', data.session.refresh_token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  const redirectPath = searchParams.redirect || '/dashboard';
  redirect(redirectPath);
}