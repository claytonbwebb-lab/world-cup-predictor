'use client';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import TeamBadge from '@/components/TeamBadge';

import { SEASON_START, getWeekNumber, getWeekRange, getWeekLabel, getWeekDropdownLabel } from '@/lib/weeks';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_flag: string;
  away_flag: string;
  group_stage: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  is_locked: boolean;
  result_entered: boolean;
  week_number: number | null;
}

interface Prediction {
  match_id: string;
  home_prediction: number;
  away_prediction: number;
  points_awarded: number;
  scored_at: string | null;
}

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMatch, setSavedMatch] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(-1); // -1 = compute on first load
  const [doubleUpPick, setDoubleUpPick] = useState<string | null>(null);
  const [doubleUpLocked, setDoubleUpLocked] = useState(false);
  const [togglingDoubleUp, setTogglingDoubleUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Auto-default to this week → next week → earliest week on first load
  useEffect(() => {
    if (selectedWeek !== -1) return; // already set
    load(); // first load — will compute and set the default week
  }, []);

  // Reload when selected week changes (excluding initial -1)
  useEffect(() => {
    if (selectedWeek === -1) return;
    load(selectedWeek);
  }, [selectedWeek]);

  // Auto-refresh every 30s to detect kickoff passing / admin changes
  useEffect(() => {
    const interval = setInterval(() => {
      load(selectedWeek);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedWeek]);

  async function load(weekOverride?: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    // Fetch distinct week numbers from upcoming/locked matches (no completed)
    const { data: weekData } = await supabase
      .from('matches')
      .select('week_number')
      .not('result_entered', 'eq', true)
      .not('week_number', 'is', null)
      .order('week_number', { ascending: false });
    const weeks = Array.from(new Set((weekData || []).map((m: { week_number: number }) => m.week_number))).sort((a, b) => a - b); // asc
    setAvailableWeeks(weeks);

    // Fixtures page only shows unscored matches (results page shows scored ones)
    let query = supabase
      .from('matches')
      .select('*')
      .not('result_entered', 'eq', true)
      .order('kickoff_at', { ascending: true });

    const qWeek = weekOverride !== undefined ? weekOverride : selectedWeek;

    // First load: compute the default week (this week → next week → earliest)
    if (weekOverride === undefined && selectedWeek === -1 && weeks.length > 0) {
      const now = new Date();
      const thisWeek = getWeekNumber(now);
      // Find this week, or fall back to the earliest available
      const defaultWeek = weeks.includes(thisWeek) ? thisWeek
        : weeks.find(w => w > thisWeek) ?? weeks[0];
      setSelectedWeek(defaultWeek);
      query = query.eq('week_number', defaultWeek);
    } else if (qWeek !== -1) {
      query = query.eq('week_number', qWeek as number);
    }

    const { data: matchData } = await query;

    const { data: predData } = await supabase
      .from('predictions').select('*').eq('user_id', user.id);

    const predMap = new Map((predData || []).map(p => [p.match_id, p]));
    const initInputs: Record<string, { home: number; away: number }> = {};
    for (const m of matchData || []) {
      const p = predMap.get(m.id);
      initInputs[m.id] = { home: p ? p.home_prediction : 0, away: p ? p.away_prediction : 0 };
    }

    // Load Double Up state for the week being viewed
    const activeWeek = weekOverride !== undefined ? weekOverride : selectedWeek;
    if (activeWeek !== -1) {
      const weekNum = activeWeek as number;

      // Always read double-up via API (bypasses RLS)
      const duRes = await fetch(`/api/double-up?weekNumber=${weekNum}`);
      if (duRes.ok) {
        const duData = await duRes.json();
        setDoubleUpPick(duData.matchId);
        setDoubleUpLocked(duData.isLocked);
      }
    } else {
      setDoubleUpPick(null);
      setDoubleUpLocked(false);
    }

    setMatches(matchData || []);
    setPredictions(predMap);
    setInputs(initInputs);
    setLoading(false);
  }

  async function saveAllPredictions() {
    setSaving(true);
    const toSave = upcoming.map(m => ({
      match_id: m.id,
      home_prediction: inputs[m.id]?.home ?? 0,
      away_prediction: inputs[m.id]?.away ?? 0,
    }));
    await Promise.all(toSave.map(p =>
      fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
    ));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load(selectedWeek);
  }

  async function saveMatch(matchId: string) {
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        home_prediction: inputs[matchId]?.home ?? 0,
        away_prediction: inputs[matchId]?.away ?? 0,
      }),
    });
    if (res.ok) {
      setSavedMatch(matchId);
      setTimeout(() => setSavedMatch(null), 3000);
      await load(selectedWeek);
    } else {
      const err = await res.json();
      alert('Failed: ' + (err.error || 'Unknown error'));
    }
  }

  async function toggleDoubleUp(matchId: string) {
    if (doubleUpLocked || togglingDoubleUp) return;
    setTogglingDoubleUp(true);
    const previousPick = doubleUpPick;
    const newPick = doubleUpPick === matchId ? null : matchId;
    try {
      const res = await fetch('/api/double-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: newPick, weekNumber: selectedWeek }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Double-up toggle failed:', err.error || res.statusText);
        // Revert optimistic update on failure
        setDoubleUpPick(previousPick);
        alert(err.error || 'Failed to set Double Up. Did you save your prediction first?');
      } else {
        setDoubleUpPick(newPick);
      }
    } catch (e) {
      console.error('Double-up toggle network error:', e);
      setDoubleUpPick(previousPick);
    }
    setTogglingDoubleUp(false);
  }

  const now = new Date();
  const upcoming  = matches.filter(m => !m.is_locked && new Date(m.kickoff_at) > now);
  const locked    = matches.filter(m => m.is_locked || new Date(m.kickoff_at) <= now);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  // Build week options for selector — position-based labels for fixtures
  // (use calendar-based getWeekDropdownLabel from lib/weeks for results/leaderboard)


  function ScoreStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))}
          className="w-8 h-8 rounded-lg bg-surfaceLight hover:bg-primary hover:text-white text-text font-bold text-lg flex items-center justify-center transition-colors select-none">
          +
        </button>
        <span className="text-3xl font-black w-10 text-center leading-none">{value}</span>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg bg-surfaceLight hover:bg-primary hover:text-white text-text font-bold text-lg flex items-center justify-center transition-colors select-none">
          −
        </button>
      </div>
    );
  }

  function MatchCard({ match, onSave, justSaved }: { match: Match; onSave?: (id: string) => Promise<void>; justSaved?: boolean }) {
    const pred = predictions.get(match.id);
    const isLocked = match.is_locked || new Date(match.kickoff_at) <= now;
    const vals = inputs[match.id] || { home: 0, away: 0 };
    const hasPredicted = predictions.has(match.id);
    const isDoubleUp = doubleUpPick === match.id;
    const canDoubleUp = hasPredicted && !isLocked && selectedWeek !== -1 && !doubleUpLocked;

    return (
      <div className="card">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4 text-xs text-textMuted">
          <div className="flex items-center gap-2">
            <span className="font-medium uppercase tracking-wide">{match.group_stage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{fmtDate(match.kickoff_at)}</span>
            {isLocked && (
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Locked</span>
            )}
          </div>
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamBadge value={match.home_flag} size="lg" />
            <span className="font-bold text-sm text-center leading-tight">{match.home_team}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLocked ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-textMuted">{pred ? pred.home_prediction : '?'}</span>
                <span className="text-textMuted font-bold text-sm">v</span>
                <span className="text-3xl font-black text-textMuted">{pred ? pred.away_prediction : '?'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ScoreStepper value={vals.home} onChange={v => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: v } }))} />
                <span className="text-textMuted font-bold text-lg px-1">v</span>
                <ScoreStepper value={vals.away} onChange={v => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: v } }))} />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <TeamBadge value={match.away_flag} size="lg" />
            <span className="font-bold text-sm text-center leading-tight">{match.away_team}</span>
          </div>
        </div>

        {/* Double Up toggle + save row */}
        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Double Up — bottom-left */}
          {canDoubleUp && (
            <button
              type="button"
              disabled={togglingDoubleUp}
              onClick={() => toggleDoubleUp(match.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border-2 transition-all ${
                isDoubleUp
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-surfaceLight bg-surfaceLight/50 text-textMuted hover:border-yellow-400/40'
              }`}
            >
              <span>{isDoubleUp ? '⭐' : '☆'}</span>
              {isDoubleUp ? 'Double Up!' : 'Double Up'}
            </button>
          )}
          {hasPredicted && (isLocked || doubleUpLocked) && isDoubleUp && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border-2 border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
              ⭐ Double Up locked
            </span>
          )}
          {/* Spacer if no double up shown */}
          {(!canDoubleUp && !(hasPredicted && isDoubleUp)) && <div />}

          {/* Save button — right side */}
          {!isLocked && onSave && (
            <div className="flex items-center gap-3">
              {justSaved && (
                <span className="text-xs text-green-400 font-medium animate-pulse">✓ Saved!</span>
              )}
              <button
                onClick={() => onSave(match.id)}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary font-medium px-4 py-2 rounded-lg transition-colors"
              >
                💾 Save
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3">Fixtures & Predictions</h1>

          {/* Week selector — no 'all' option, just individual weeks */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-textMuted font-medium">Week:</label>
            <select
              value={String(selectedWeek !== -1 ? selectedWeek : '')}
              onChange={e => setSelectedWeek(Number(e.target.value))}
              className="input py-2 text-sm max-w-xs"
            >
              {selectedWeek === -1 && <option value="">Loading...</option>}
              {availableWeeks.sort((a, b) => b - a).map(w => (
                <option key={w} value={String(w)}>{getWeekDropdownLabel(w)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Double Up explainer */}
        {selectedWeek !== -1 && !loading && matches.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚡</span>
              <div>
                <p className="text-sm font-semibold text-yellow-400 mb-1">Double Up — 2× your points!</p>
                <p className="text-xs text-textMuted leading-relaxed">
                  After saving your predictions, mark one match as your Double Up. If your prediction is correct: 1pt → 2pt, 3pt → 6pt. You can change it until the first match kicks off.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-textMuted">Loading fixtures...</div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary uppercase tracking-wide">
                  <span>📅</span> Upcoming — enter your predictions
                </h2>
                <div className="space-y-3">
                  {upcoming.map(m => <MatchCard key={m.id} match={m} onSave={saveMatch} justSaved={savedMatch === m.id} />)}
                </div>
              </section>
            )}
            {locked.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-400 uppercase tracking-wide">
                  <span>🔒</span> Locked
                </h2>
                <div className="space-y-3">
                  {locked.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {matches.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-textMuted">No fixtures{selectedWeek !== -1 ? ` for ${getWeekRange(selectedWeek)}` : ''} yet</p>
                {selectedWeek !== -1 && (
                  <p className="text-textMuted text-sm mt-1">Check back soon!</p>
                )}
              </div>
            )}

          </div>
        )}
      </main>
      {upcoming.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-background to-transparent">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={saveAllPredictions}
              disabled={saving}
              className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20"
            >
              {saving ? 'Saving...' : saved ? '✓ All Predictions Saved!' : '💾 Save All Predictions'}
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}