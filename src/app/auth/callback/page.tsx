'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'joining_league'>('loading');

  useEffect(() => {
    const supabase = createClient();

    // Handle password reset flow — token must be exchanged for a session via verifyOtp
    const type = searchParams.get('type');
    const recoveryToken = searchParams.get('token');
    const email = searchParams.get('email');
    if (type === 'recovery' && recoveryToken) {
      (async () => {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token: recoveryToken,
          email: email || '',
        });
        if (error) {
          setStatus('error');
          setTimeout(() => router.replace('/auth/login'), 3000);
        } else {
          setStatus('success');
          setTimeout(() => router.replace('/auth/reset-password'), 800);
        }
      })();
      return;
    }

    const handlePostAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      setStatus('success');

      // Check for pending VIP join code first (higher priority than regular league join)
      const vipCode =
        typeof localStorage !== 'undefined' ? localStorage.getItem('pending_vip_join') : null;

      if (vipCode) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem('pending_vip_join');
        setStatus('joining_league');
        try {
          const response = await fetch('/api/vip-league/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: vipCode }),
          });
          // Always redirect to VIP page after trying to join (already_member is fine)
          router.replace('/vip-league');
        } catch {
          router.replace('/vip-league');
        }
        return true;
      }

      // Regular league join code
      const joinCode =
        searchParams.get('join') ||
        (typeof localStorage !== 'undefined' ? localStorage.getItem('pendingJoinLeagueCode') : null);

      if (joinCode) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem('pendingJoinLeagueCode');
        setStatus('joining_league');
        try {
          const response = await fetch('/api/leagues/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: joinCode }),
          });
          if (response.ok) {
            const data = await response.json();
            router.replace(`/leagues/${data.league.id}`);
          } else {
            router.replace('/dashboard');
          }
        } catch {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/dashboard');
      }
      return true;
    };

    // Listen for auth state change (handles email confirmation token in URL hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        subscription.unsubscribe();
        handlePostAuth();
      }
    });

    // Also handle already-signed-in case
    handlePostAuth();

    // Timeout fallback
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setStatus('error');
        setTimeout(() => router.replace('/auth/login'), 2000);
      }
    }, 8000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">
          {status === 'loading' && '🔐'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
          {status === 'joining_league' && '🏆'}
        </div>
        <p className="text-textMuted">
          {status === 'loading' && 'Signing you in...'}
          {status === 'success' && 'Signed in! Redirecting...'}
          {status === 'joining_league' && 'Joining your league...'}
          {status === 'error' && 'Link may have expired. Redirecting to login...'}
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-textMuted">Loading...</div></div>}>
      <CallbackContent />
    </Suspense>
  );
}