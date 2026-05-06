'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [over18, setOver18] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) localStorage.setItem('pendingJoinLeagueCode', joinCode);
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    if (!over18) {
      setError('You must be aged 18 or over to participate');
      setLoading(false);
      return;
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, marketing_consent: marketingConsent },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}${searchParams.get('join') ? '&join=' + searchParams.get('join') : ''}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (authData.user) {
      // Profile is auto-created by trigger with marketing_consent from user metadata
      setSuccess(true);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}${searchParams.get('join') ? '&join=' + searchParams.get('join') : ''}` },
    });
    setResendLoading(false);
    setResendMessage(error ? 'Could not resend — please try again.' : 'Confirmation email resent! Check your inbox.');
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-textMuted mb-4">
              We sent a confirmation link to <strong>{email}</strong>
            </p>
            <p className="text-textMuted text-sm mb-4">
              Click the link to activate your account, then come back to sign in.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-300 mb-6 text-left">
              <span className="font-semibold">Can&apos;t find it?</span> Check your <strong>spam or junk folder</strong> — look for an email from <strong>support@playpredictwin.com</strong>. If you use Gmail, also check the Promotions tab.
            </div>
            {resendMessage ? (
              <p className={`text-sm mb-4 ${resendMessage.includes('resent') ? 'text-green-400' : 'text-red-400'}`}>
                {resendMessage}
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50 mb-4 block mx-auto"
              >
                {resendLoading ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}
            <Link href={`/auth/login?redirect=${redirect}`} className="btn-primary block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="mb-4 block"><Image src="/images/logos/logo3.jpg" alt="Play Predict Win" width={300} height={100} className="mx-auto object-contain" style={{ maxHeight: '80px' }} /></Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-textMuted">Join the prediction league</p>
        </div>

        <div className="card">
          <form className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="input w-full" placeholder="football_fan" required minLength={3} autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input w-full" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10" placeholder="••••••••" required minLength={6} autoComplete="new-password" />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
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
              <p className="text-textMuted text-xs mt-1">Minimum 6 characters</p>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="over18"
                checked={over18}
                onChange={(e) => setOver18(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <label htmlFor="over18" className="text-sm text-textMuted leading-snug">
                I am aged 18 or over and agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Terms &amp; Conditions
                </a>
              </label>
            </div>

            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
              <input
                type="checkbox"
                id="marketing"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <label htmlFor="marketing" className="text-sm text-textMuted leading-snug">
                <label htmlFor="marketing" className="text-sm text-textMuted leading-snug">
                  Tick to consent to receiving emails from us. Don&apos;t worry, we won&apos;t clog up your inbox. Just handy football tips, prediction reminders, and the occasional &ldquo;don&apos;t forget your picks&rdquo; message.
                </label>
              </label>
            </div>

            <button type="submit" onClick={handleSignup} disabled={loading || !over18} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="text-center text-textMuted mt-6">
          Already have an account?{' '}
          <Link href={`/auth/login?redirect=${redirect}`} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-textMuted">Loading...</div></div>}>
      <SignupForm />
    </Suspense>
  );
}
