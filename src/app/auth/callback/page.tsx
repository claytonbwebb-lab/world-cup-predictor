import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');

  useEffect(() => {
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    if (!code) {
      setStatus('error');
      setTimeout(() => router.replace('/auth/login'), 2000);
      return;
    }

    const supabase = createClient();

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('Callback error:', error.message);
        setStatus('error');
        setTimeout(() => router.replace('/auth/login'), 2000);
      } else {
        setStatus('success');
        // Small delay to ensure localStorage is written before navigation
        setTimeout(() => router.replace(redirectTo), 300);
      }
    });
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
          {status === 'error' && 'Something went wrong. Redirecting...'}
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
