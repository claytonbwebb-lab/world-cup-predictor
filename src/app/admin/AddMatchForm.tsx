'use client';

import { useState } from 'react';
import TeamSelect from '@/components/TeamSelect';

function localToUtcIso(localDt: string): string {
  return new Date(localDt).toISOString();
}

export default function AddMatchForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeBadge, setHomeBadge] = useState('');
  const [awayBadge, setAwayBadge] = useState('');
  const [groupStage, setGroupStage] = useState('');
  const [kickoffAt, setKickoffAt] = useState('');

  function handleTeamChange(name: string, teamName: string, badge: string) {
    if (name === 'home_team') {
      setHomeTeam(teamName);
      setHomeBadge(badge);
    } else {
      setAwayTeam(teamName);
      setAwayBadge(badge);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    if (!homeTeam || !awayTeam || !kickoffAt) {
      setStatus('error');
      setMessage('Please select both teams and a kickoff time.');
      setLoading(false);
      return;
    }

    const kickoffUtc = localToUtcIso(kickoffAt);

    try {
      const fd = new FormData();
      fd.set('home_team', homeTeam);
      fd.set('away_team', awayTeam);
      fd.set('home_flag', homeBadge);
      fd.set('away_flag', awayBadge);
      fd.set('group_stage', groupStage);
      fd.set('kickoff_at', kickoffUtc);

      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        body: fd,
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
        <TeamSelect
          label="Home Team"
          name="home_team"
          value={homeTeam}
          onChange={handleTeamChange}
        />
        <TeamSelect
          label="Away Team"
          name="away_team"
          value={awayTeam}
          onChange={handleTeamChange}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gameweek / Stage</label>
          <input
            type="text"
            value={groupStage}
            onChange={(e) => setGroupStage(e.target.value)}
            className="input w-full"
            placeholder="GW1, GW2, Quarter-final, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Kickoff (your local time)</label>
          <input
            type="datetime-local"
            name="kickoff_at"
            required
            value={kickoffAt}
            onChange={(e) => setKickoffAt(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      {status !== 'idle' && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          status === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Match'}
      </button>
    </form>
  );
}
