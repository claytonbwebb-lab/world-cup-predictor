'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  kickoff_at: string;
}

interface DoubleUpPickerProps {
  weekNumber: number;
  matches: Match[];          // matches the user has predicted
  onPicked?: (matchId: string) => void;
}

interface DoubleUpState {
  matchId: string | null;
  isLocked: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export default function DoubleUpPicker({ weekNumber, matches, onPicked }: DoubleUpPickerProps) {
  const [state, setState] = useState<DoubleUpState>({ matchId: null, isLocked: false, loading: true, saving: false, error: null });
  const supabase = createClient();

  useEffect(() => {
    fetchState();
  }, [weekNumber]);

  async function fetchState() {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`/api/double-up?weekNumber=${weekNumber}`);
      if (!res.ok) throw new Error('Failed to load Double Up state');
      const data = await res.json();
      setState({ matchId: data.matchId, isLocked: data.isLocked, loading: false, saving: false, error: null });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message }));
    }
  }

  async function pickMatch(matchId: string) {
    if (state.isLocked || state.saving) return;
    setState(s => ({ ...s, saving: true, error: null }));
    try {
      const res = await fetch('/api/double-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, weekNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setState(s => ({ ...s, matchId, saving: false }));
      onPicked?.(matchId);
    } catch (e: any) {
      setState(s => ({ ...s, saving: false, error: e.message }));
    }
  }

  if (state.loading) {
    return (
      <div className="card mt-4 flex items-center justify-center py-6">
        <span className="text-textMuted text-sm">Loading Double Up...</span>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="card mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="font-bold text-base">Double Up</h3>
          <span className="text-xs text-textMuted bg-surfaceLight px-2 py-0.5 rounded-full">Pick 1 match · 2× points</span>
        </div>
        {state.isLocked && (
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            🔒 Locked
          </span>
        )}
        {!state.isLocked && state.matchId && (
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full font-medium">
            ✓ Saved
          </span>
        )}
      </div>

      {state.error && (
        <div className="mb-3 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{state.error}</div>
      )}

      {!state.isLocked && (
        <p className="text-xs text-textMuted mb-3">
          Tap a match to make it your Double Up. You can change it until the first match kicks off.
        </p>
      )}

      {state.isLocked && (
        <p className="text-xs text-textMuted mb-3">
          Double Up is locked for this week — the first match has kicked off.
        </p>
      )}

      {/* Match list */}
      <div className="space-y-2">
        {matches.map(match => {
          const isSelected = state.matchId === match.id;
          const kickoff = new Date(match.kickoff_at);
          const isPast = kickoff <= new Date();

          return (
            <button
              key={match.id}
              type="button"
              disabled={state.isLocked || state.saving}
              onClick={() => pickMatch(match.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : state.isLocked || isPast
                    ? 'border-surfaceLight bg-surfaceLight/30 opacity-60 cursor-not-allowed'
                    : 'border-surfaceLight hover:border-primary/40 bg-surfaceLight/50 cursor-pointer'
                }
              `}
            >
              {/* Star indicator */}
              <span className={`text-lg shrink-0 ${isSelected ? 'opacity-100' : 'opacity-30'}`}>
                {isSelected ? '⭐' : '☆'}
              </span>

              {/* Teams */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">
                  {match.home_team} <span className="text-textMuted text-xs">v</span> {match.away_team}
                </span>
                <span className="text-xs text-textMuted">
                  {kickoff.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' · '}
                  {kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Points label */}
              <div className="shrink-0 text-right">
                {isSelected ? (
                  <span className="text-xs font-bold text-yellow-400">Double Up!</span>
                ) : (
                  <span className="text-xs text-textMuted">tap to select</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Points reminder */}
      <div className="mt-3 pt-3 border-t border-surfaceLight">
        <div className="flex items-center justify-between text-xs text-textMuted">
          <span>Correct result</span>
          <span className={state.matchId ? 'font-bold text-yellow-400' : ''}>1pt → 2pt</span>
        </div>
        <div className="flex items-center justify-between text-xs text-textMuted mt-1">
          <span>Exact score</span>
          <span className={state.matchId ? 'font-bold text-yellow-400' : ''}>3pt → 6pt</span>
        </div>
      </div>
    </div>
  );
}