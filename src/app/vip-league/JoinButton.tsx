'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JoinButtonProps {
  token?: string;
}

export default function JoinButton({ token = 'VIP2026SECRET' }: JoinButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vip-league/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Could not join');
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-2 text-amber-400 font-medium">
        ✅ You&apos;re in the VIP League! Refresh to see your position.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        {loading ? 'Joining...' : 'Join the VIP League'}
      </button>
      {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
}
