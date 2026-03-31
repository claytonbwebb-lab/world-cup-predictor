import NavBar from '@/components/NavBar';
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true });

    const { data: predData } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);

    const predMap = new Map((predData || []).map(p => [p.match_id, p]));
    const initInputs: Record<string, { home: string; away: string }> = {};
    for (const m of matchData || []) {
      const p = predMap.get(m.id);
      initInputs[m.id] = {
        home: p ? String(p.home_prediction) : '',
        away: p ? String(p.away_prediction) : '',
      };
    }

    setMatches(matchData || []);
    setPredictions(predMap);
    setInputs(initInputs);
    setLoading(false);
  }

  async function savePrediction(matchId: string) {
    const vals = inputs[matchId];
    if (vals.home === '' || vals.away === '') return;
    setSaving(matchId);
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        home_prediction: parseInt(vals.home),
        away_prediction: parseInt(vals.away),
      }),
    });
    setSaving(null);
    if (res.ok) {
      setSaved(matchId);
      setTimeout(() => setSaved(null), 2000);
      load();
    }
  }

  const now = new Date();
  const upcoming = matches.filter(m => !m.result_entered && !m.is_locked && new Date(m.kickoff_at) > now);
  const locked   = matches.filter(m => !m.result_entered && (m.is_locked || new Date(m.kickoff_at) <= now));
  const completed = matches.filter(m => m.result_entered);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  function ScoreInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const num = value === '' ? 0 : parseInt(value);
    return (
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(String(Math.max(0, num - 1)))}
          className="w-7 h-7 rounded bg-surfaceLight hover:bg-border text-text font-bold text-lg flex items-center justify-center transition-colors">−</button>
        <span className="w-8 text-center text-lg font-bold">{value === '' ? '0' : value}</span>
        <button type="button" onClick={() => onChange(String(Math.min(20, num + 1)))}
          className="w-7 h-7 rounded bg-surfaceLight hover:bg-border text-text font-bold text-lg flex items-center justify-center transition-colors">+</button>
      </div>
    );
  }

  function MatchCard({ match }: { match: Match }) {
    const pred = predictions.get(match.id);
    const isLocked = match.is_locked || new Date(match.kickoff_at) <= now;
    const isSaving = saving === match.id;
    const isSaved  = saved  === match.id;
    const vals = inputs[match.id] || { home: '', away: '' };

    return (
      <div className="card hover:border-border transition-colors">
        <div className="flex items-center justify-between mb-3 text-xs text-textMuted">
          <span>{match.group_stage}</span>
          <span>{fmtDate(match.kickoff_at)}</span>
          {isLocked && <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Locked</span>}
        </div>

        <div className="flex items-center justify-between">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{match.home_flag}</span>
            <span className="font-semibold">{match.home_team}</span>
          </div>

          {/* Score inputs or prediction display */}
          <div className="flex items-center gap-2 mx-4">
            {match.result_entered ? (
              <span className="text-xl font-black text-primary">{match.home_score} – {match.away_score}</span>
            ) : isLocked ? (
              <span className="text-lg font-bold text-textMuted">
                {pred ? `${pred.home_prediction} – ${pred.away_prediction}` : '? – ?'}
              </span>
            ) : (
              <>
                <ScoreInput value={vals.home} onChange={v => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: v } }))} />
                <span className="text-textMuted font-bold mx-1">–</span>
                <ScoreInput value={vals.away} onChange={v => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: v } }))} />
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold">{match.away_team}</span>
            <span className="text-2xl">{match.away_flag}</span>
          </div>
        </div>

        {/* Save button / status */}
        {!isLocked && !match.result_entered && (
          <div className="mt-3 flex justify-center">
            {isSaved ? (
              <span className="text-primary text-sm font-medium">✓ Saved!</span>
            ) : (
              <button
                onClick={() => savePrediction(match.id)}
                disabled={isSaving || vals.home === '' || vals.away === ''}
                className="btn-primary text-sm px-6"
              >
                {isSaving ? 'Saving...' : pred ? 'Update Prediction' : 'Save Prediction'}
              </button>
            )}
          </div>
        )}

        {/* Points if scored */}
        {pred?.scored_at && (
          <div className="mt-2 text-center text-sm">
            <span className="text-textMuted">Your prediction: {pred.home_prediction}–{pred.away_prediction} · </span>
            <span className={pred.points_awarded > 0 ? 'text-primary font-bold' : 'text-textMuted'}>
              {pred.points_awarded > 0 ? `+${pred.points_awarded} pts` : '0 pts'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Fixtures & Predictions</h1>

        {loading ? (
          <div className="text-center py-16 text-textMuted">Loading fixtures...</div>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                  <span>📅</span> Upcoming — enter your predictions
                </h2>
                <div className="space-y-3">
                  {upcoming.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {locked.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-400">
                  <span>🔒</span> Locked
                </h2>
                <div className="space-y-3">
                  {locked.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                  <span>✅</span> Completed
                </h2>
                <div className="space-y-3">
                  {completed.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {matches.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-textMuted">No fixtures yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
