'use client';

import { useState, useRef, useEffect } from 'react';
import { PREMIER_LEAGUE_TEAMS } from '@/lib/teams';

interface TeamSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, teamName: string, badge: string) => void;
  small?: boolean;
}

export default function TeamSelect({ label, name, value, onChange, small }: TeamSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = PREMIER_LEAGUE_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = PREMIER_LEAGUE_TEAMS.find(
    (t) => t.name.toLowerCase() === value.toLowerCase()
  );

  const labelClass = small ? 'block text-xs font-medium mb-1 text-textMuted' : 'block text-sm font-medium mb-2';

  return (
    <div ref={ref} className="relative">
      {label && <label className={labelClass}>{label}</label>}
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
          <span className="text-textMuted">Select team...</span>
        )}
        <span className="ml-auto text-textMuted text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams..."
              className="input w-full text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-textMuted text-sm">No teams found</li>
            )}
            {filtered.map((team) => (
              <li key={team.name}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(name, team.name, team.badge);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surfaceLight text-left transition-colors"
                >
                  <img src={team.badge} alt={team.name} className="w-8 h-8 object-contain shrink-0" />
                  <span className="text-sm font-medium">{team.name}</span>
                  {selected && selected.name.toLowerCase() === team.name.toLowerCase() && (
                    <span className="ml-auto text-primary text-xs">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
