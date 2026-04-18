'use client';

import { useState } from 'react';

// Convert a datetime-local string (YYYY-MM-DDTHH:mm) to a UTC ISO string.
// The browser knows the user's timezone, so new Date() here = correct local time.
function localToUtcIso(localDt: string): string {
  return new Date(localDt).toISOString();
}

export default function AddMatchForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert kickoff_at to UTC ISO before sending — server runs in UTC and must receive UTC
    const kickoffLocal = formData.get('kickoff_at') as string;
    formData.set('kickoff_at', localToUtcIso(kickoffLocal));

    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatus('success');
        setMessage('Match added — reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatus('error');
        setMessage(json.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Home Team</label>
          <input type="text" name="home_team" required className="input w-full" placeholder="Argentina" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Away Team</label>
          <input type="text" name="away_team" required className="input w-full" placeholder="Brazil" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Home Flag (emoji)</label>
          <input type="text" name="home_flag" className="input w-full" placeholder="🇦🇷" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Away Flag (emoji)</label>
          <input type="text" name="away_flag" className="input w-full" placeholder="🇧🇷" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Group/Stage</label>
          <input type="text" name="group_stage" className="input w-full" placeholder="Group A, Quarter-final, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Kickoff (your local time)</label>
          <input type="datetime-local" name="kickoff_at" required className="input w-full" />
        </div>
      </div>

      {status !== 'idle' && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {message}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Match'}
      </button>
    </form>
  );
}