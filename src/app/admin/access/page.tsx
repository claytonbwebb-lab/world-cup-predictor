import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

const ALLOWED_ADMINS = ['brightstacklabs@gmail.com'];

export default async function AdminAccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMINS.includes(user.email?.toLowerCase() || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="card max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-textMuted text-sm">You must be logged in as brightstacklabs@gmail.com to access the admin panel.</p>
          <Link href="/auth/login" className="btn-primary mt-4 inline-block">
            Log In
          </Link>
        </div>
      </div>
    );
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

  redirect('/admin');
}
