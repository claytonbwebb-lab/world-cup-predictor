'use client';

import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [over18, setOver18] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Also insert username and email into profiles
      await supabase.from('profiles').upsert({
        id: (await supabase.auth.getUser()).data.user?.id,
        username,
        email,
      });
      setSuccess(true);
    }
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
            <p className="text-textMuted text-sm">
              Click the link to activate your account, then come back to sign in.
            </p>
            <Link href={`/auth/login?redirect=${redirect}`} className="btn-primary mt-6 block">
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
          <Link href="/" className="text-4xl mb-4 block">🏠</Link>
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input w-full" placeholder="••••••••" required minLength={6} />
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
                  Terms & Conditions
                </a>
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
