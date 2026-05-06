'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) localStorage.setItem('pendingJoinLeagueCode', joinCode);
  }, [searchParams]);

  async function syncMarketingConsent(userId: string, consent: boolean) {
    await supabase
      .from('profiles')
      .update({ marketing_consent: consent })
      .eq('id', userId);
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let loginEmail = email.trim();

    if (!email.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', email.trim())
        .single();

      if (profile?.email) {
        loginEmail = profile.email;
      } else {
        setError('Username not found. Try your email address instead.');
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      const consent = data.user.user_metadata?.marketing_consent;
      if (consent !== undefined) {
        await syncMarketingConsent(data.user.id, consent);
      }
      router.push(redirect);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicLinkSent(true);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="mb-4 block"><Image src="/images/logos/logo3.jpg" alt="Play Predict Win" width={300} height={100} className="mx-auto object-contain" style={{ maxHeight: '80px' }} /></Link>
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
          ) : resetSent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="text-lg mb-4">Check your email!</p>
              <p className="text-textMuted text-sm">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <button onClick={() => setResetSent(false)} className="btn-secondary mt-6 w-full">
                Try again
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
                <label className="block text-sm font-medium mb-2">Email or Username</label>
                <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input w-full" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input w-full pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
              <button type="button" onClick={handleMagicLink} disabled={loading} className="btn-secondary w-full">
                Send Magic Link
              </button>
              <div className="text-center mt-2">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-textMuted hover:text-primary transition-colors">
                  Forgot password?
                </button>
              </div>
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

import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-textMuted">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
