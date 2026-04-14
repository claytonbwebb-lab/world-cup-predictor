'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const supabase = createClient();

    // With implicit flow, Supabase detects the #access_token in the URL hash automatically.
    // We just listen for the SIGNED_IN event and redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        subscription.unsubscribe();
        setTimeout(() => router.replace('/dashboard'), 500);
      }
    });

    // Also check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
        subscription.unsubscribe();
        setTimeout(() => router.replace('/dashboard'), 500);
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus('success');
          router.replace('/dashboard');
        } else {
          setStatus('error');
          setTimeout(() => router.replace('/auth/login'), 2000);
        }
      });
    }, 6000);

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
        </div>
        <p className="text-textMuted">
          {status === 'loading' && 'Signing you in...'}
          {status === 'success' && 'Signed in! Redirecting...'}
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
