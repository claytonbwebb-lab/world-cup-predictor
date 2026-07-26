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
  const ref = useRef<HTMLDivElement>(null);

  const leagues = ['Premier League', 'Championship', 'League One', 'League Two'] as const;

  const filtered = ALL_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayed = query
    ? filtered
    : filtered.filter((t) => t.league === activeLeague);

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
                <li className="px-4 py-2 text-textMuted text-sm">No clubs found</li>
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
              <div className="flex border-b border-border">
                {leagues.map((league) => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setActiveLeague(league)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      activeLeague === league
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    {league.replace('League ', 'L')}
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