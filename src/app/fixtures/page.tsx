'use client';
import NavBar from '@/components/NavBar';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.playpredictwin.com" },
    { "@type": "ListItem", "position": 2, "name": "Fixtures", "item": "https://www.playpredictwin.com/fixtures" },
  ],
};

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inputs, setInputs] = useState<Record<string, { home: number; away: number }>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: matchData } = await supabase
      .from('matches').select('*').order('kickoff_at', { ascending: true });

    const { data: predData } = await supabase
      .from('predictions').select('*').eq('user_id', user.id);

    const predMap = new Map((predData || []).map(p => [p.match_id, p]));
    const initInputs: Record<string, { home: number; away: number }> = {};
    for (const m of matchData || []) {
      const p = predMap.get(m.id);
      initInputs[m.id] = { home: p ? p.home_prediction : 0, away: p ? p.away_prediction : 0 };
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
    load();
  }

  const now = new Date();
  const upcoming  = matches.filter(m => !m.result_entered && !m.is_locked && new Date(m.kickoff_at) > now);
  const locked    = matches.filter(m => !m.result_entered && (m.is_locked || new Date(m.kickoff_at) <= now));
  const completed = matches.filter(m => m.result_entered);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

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

  function MatchCard({ match }: { match: Match }) {
    const pred = predictions.get(match.id);
    const isLocked = match.is_locked || new Date(match.kickoff_at) <= now;
    const vals = inputs[match.id] || { home: 0, away: 0 };

    return (
      <div className="card">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4 text-xs text-textMuted">
          <span className="font-medium uppercase tracking-wide">{match.group_stage}</span>
          <div className="flex items-center gap-2">
            <span>{fmtDate(match.kickoff_at)}</span>
            {isLocked && !match.result_entered && (
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Locked</span>
            )}
            {match.result_entered && (
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Final</span>
            )}
          </div>
        </div>

        {/* Score row — Sky Super 6 style */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <span className="text-4xl">{match.home_flag}</span>
            <span className="font-bold text-sm text-center leading-tight">{match.home_team}</span>
          </div>

          {/* Score / steppers */}
          <div className="flex items-center gap-3 shrink-0">
            {match.result_entered ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-primary">{match.home_score}</span>
                <span className="text-textMuted font-bold">v</span>
                <span className="text-4xl font-black text-primary">{match.away_score}</span>
              </div>
            ) : isLocked ? (
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

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <span className="text-4xl">{match.away_flag}</span>
            <span className="font-bold text-sm text-center leading-tight">{match.away_team}</span>
          </div>
        </div>

        {/* Points if scored */}
        {match.result_entered && pred?.scored_at && (
          <div className="mt-3 text-center text-sm py-2 bg-surfaceLight rounded-lg">
            <span className="text-textMuted">Your prediction: {pred.home_prediction}–{pred.away_prediction} · </span>
            <span className={pred.points_awarded > 0 ? 'text-primary font-bold' : 'text-textMuted'}>
              {pred.points_awarded > 0 ? `+${pred.points_awarded} pts` : '0 pts'}
            </span>
          </div>
        )}
        {isLocked && !match.result_entered && pred && (
          <div className="mt-3 text-center text-sm text-textMuted py-1">
            Your prediction: {pred.home_prediction}–{pred.away_prediction}
          </div>
        )}
        {isLocked && !match.result_entered && !pred && (
          <div className="mt-3 text-center text-sm text-textMuted/40 py-1">No prediction made</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Fixtures & Predictions</h1>

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
                  {upcoming.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
                <div className="mt-6 sticky bottom-4">
                  <button
                    onClick={saveAllPredictions}
                    disabled={saving}
                    className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20"
                  >
                    {saving ? 'Saving...' : saved ? '✓ All Predictions Saved!' : '💾 Save All Predictions'}
                  </button>
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
            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-400 uppercase tracking-wide">
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
