'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  joinCode: string | null;
}

export default function VipJoinClient({ joinCode: urlCode }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [effectiveCode, setEffectiveCode] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check both URL param and localStorage for the join code
  useEffect(() => {
    const code = urlCode || localStorage.getItem('pending_vip_join');
    if (code) {
      setEffectiveCode(code);
      if (urlCode) {
        // URL param takes precedence — clean up localStorage if it was set
        localStorage.removeItem('pending_vip_join');
      }
    }
  }, [urlCode]);

  // Process the join when we have a code and are authenticated
  useEffect(() => {
    if (!effectiveCode) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Store code and redirect to login
        localStorage.setItem('pending_vip_join', effectiveCode);
        router.push('/auth/login');
        return;
      }

      // Auto-join via API
      setLoading(true);
      const res = await fetch('/api/vip-league/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: effectiveCode }),
      });
      const json = await res.json();
      setLoading(false);

      if (res.ok || json.already_member) {
        setDone(true);
        // Clear localStorage to prevent re-joining on future visits
        localStorage.removeItem('pending_vip_join');
        router.refresh();
      } else {
        setError(json.error || 'Could not join');
      }
    })();
  }, [effectiveCode, supabase, router]);

  if (done) {
    return (
      <div className="text-center py-2 text-amber-400 font-medium">
        ✅ You&apos;re in the VIP League!
      </div>
    );
  }

  if (!effectiveCode) {
    return null; // No join code — show no join UI
  }

  if (loading) {
    return (
      <div className="text-center py-2 text-textMuted">
        Joining...
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={async () => {
          setLoading(true);
          setError('');
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            localStorage.setItem('pending_vip_join', effectiveCode!);
            router.push('/auth/login');
            return;
          }
          const res = await fetch('/api/vip-league/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: effectiveCode }),
          });
          const json = await res.json();
          setLoading(false);
          if (res.ok || json.already_member) {
            setDone(true);
            localStorage.removeItem('pending_vip_join');
            router.refresh();
          } else {
            setError(json.error || 'Could not join');
          }
        }}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        Join the VIP League
      </button>
      {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
}