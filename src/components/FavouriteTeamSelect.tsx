'use client';

import { useState, useRef, useEffect } from 'react';
import { ALL_TEAMS } from '@/lib/teams';

interface FavouriteTeamSelectProps {
  value: string;
  onChange: (team: string) => void;
  label?: string;
  small?: boolean;
}

export default function FavouriteTeamSelect({ value, onChange, label, small }: FavouriteTeamSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeLeague, setActiveLeague] = useState<string>('Premier League');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestTeam, setRequestTeam] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const leagues = [
    'Premier League', 'Championship', 'League One', 'League Two',
    'Scottish Premiership', 'Scottish Championship', 'Scottish League One', 'Scottish League Two',
    'Non-League',
  ] as const;

  const filtered = ALL_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayed = query
    ? filtered
    : filtered.filter((t) => t.league === activeLeague);

  useEffect(() => {
    if (query && displayed.length === 0) {
      setRequestTeam(query);
      setRequestMessage('');
      setRequestError('');
    }
  }, [query, displayed.length]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = ALL_TEAMS.find((t) => t.name.toLowerCase() === value.toLowerCase());

  async function handleRequestTeam(e: React.FormEvent) {
    e.preventDefault();
    setRequestSending(true);
    setRequestMessage('');
    setRequestError('');

    try {
      const res = await fetch('/api/team-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail, team: requestTeam }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not send request');
      setRequestMessage('Thanks — we’ll review it and let you know.');
      setRequestEmail('');
      setRequestTeam('');
    } catch (err: any) {
      setRequestError(err.message || 'Could not send request');
    } finally {
      setRequestSending(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className={small ? 'block text-xs font-medium mb-1 text-textMuted' : 'block text-sm font-medium mb-2'}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full input flex items-center gap-3 text-left"
      >
        {selected ? (
          <>
            <img src={selected.badge} alt={selected.name} className="w-8 h-8 object-contain shrink-0" />
            <span className={small ? 'text-sm' : ''}>{selected.name}</span>
          </>
        ) : (
          <span className="text-textMuted">Select your club...</span>
        )}
        <span className="ml-auto text-textMuted text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-96 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs..."
              className="input w-full text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {query ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {displayed.length === 0 && (
                <li className="px-4 py-3">
                  <p className="text-textMuted text-sm mb-3">No clubs found.</p>
                  <form onSubmit={handleRequestTeam} className="space-y-2 rounded-lg border border-border bg-surfaceLight/50 p-3">
                    <p className="text-sm font-medium text-textPrimary">Want us to add your team?</p>
                    <input
                      type="text"
                      value={requestTeam}
                      onChange={(e) => setRequestTeam(e.target.value)}
                      placeholder="Team name"
                      className="input w-full text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <input
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="Your email"
                      className="input w-full text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {requestError && <p className="text-red-400 text-xs">{requestError}</p>}
                    {requestMessage && <p className="text-green-400 text-xs">{requestMessage}</p>}
                    <button
                      type="submit"
                      disabled={requestSending}
                      className="btn-secondary w-full text-sm py-2"
                    >
                      {requestSending ? 'Sending...' : 'Request this team'}
                    </button>
                  </form>
                </li>
              )}
              {displayed.map((team) => (
                <li key={team.name}>
                  <button
                    type="button"
                    onClick={() => { onChange(team.name); setQuery(''); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surfaceLight text-left transition-colors"
                  >
                    <img src={team.badge} alt={team.name} className="w-8 h-8 object-contain shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{team.name}</span>
                      <span className="text-textMuted text-xs ml-2">{team.league}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="flex border-b border-border overflow-x-auto">
                {leagues.map((league) => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setActiveLeague(league)}
                    className={`flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      activeLeague === league
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    {league
                      .replace('League ', 'L')
                      .replace('Scottish Premiership', 'Scottish PL')
                      .replace('Scottish Championship', 'Scottish Champ')
                      .replace('Scottish League One', 'Scot L1')
                      .replace('Scottish League Two', 'Scot L2')
                      .replace('Premier League', 'Premier L')
                      .replace('Championship', 'Champ')}
                  </button>
                ))}
              </div>
              <ul className="max-h-64 overflow-y-auto py-1">
                {displayed.map((team) => (
                  <li key={team.name}>
                    <button
                      type="button"
                      onClick={() => { onChange(team.name); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surfaceLight text-left transition-colors"
                    >
                      <img src={team.badge} alt={team.name} className="w-8 h-8 object-contain shrink-0" />
                      <span className="text-sm font-medium">{team.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
