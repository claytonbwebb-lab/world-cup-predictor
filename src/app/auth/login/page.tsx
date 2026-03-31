'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl mb-4 block">🏠</Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-textMuted">Sign in to your account</p>
        </div>

        <div className="card">
          {magicLinkSent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="text-lg mb-4">Check your email!</p>
              <p className="text-textMuted text-sm">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <button onClick={() => setMagicLinkSent(false)} className="btn-secondary mt-6 w-full">
                Try again with different method
              </button>
            </div>
          ) : (
            <form className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input w-full" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input w-full" placeholder="••••••••" required />
              </div>
              <button type="submit" onClick={handleEmailLogin} disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-textMuted">or</span>
                </div>
              </div>
              <button type="button" onClick={handleMagicLink} disabled={loading || !email} className="btn-secondary w-full">
                Send Magic Link
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-textMuted mt-6">
          Don&apos;t have an account?{' '}
          <Link href={`/auth/signup?redirect=${redirect}`} className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-textMuted">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
