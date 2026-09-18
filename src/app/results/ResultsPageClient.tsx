'use client';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import TeamBadge from '@/components/TeamBadge';
import { SEASON_START, getWeekLabel, getWeekRange, getWeekDropdownLabel, getWeekNumber } from '@/lib/weeks';

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
  week_number: number | null;
}

export default function ResultsPageClient() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(getWeekNumber(new Date()));
  const hasAutoSelected = useRef(false);
  const [doubleUpMatchIds, setDoubleUpMatchIds] = useState<Set<string>>(new Set());
  const [predictions, setPredictions] = useState<Map<string, any>>(new Map());
  const [totalCompleted, setTotalCompleted] = useState(0);
  const supabase = createClient();

  useEffect(() => { load(); }, [selectedWeek]);

  async function load() {
    setLoading(true);

    const { data: weekData } = await supabase
      .from('matches')
      .select('week_number')
      .eq('result_entered', true)
      .not('week_number', 'is', null)
      .order('week_number', { ascending: false });
    const weeks = Array.from(new Set((weekData || []).map((m: { week_number: number }) => m.week_number))).sort((a, b) => b - a);
    setAvailableWeeks(weeks);

    if (!hasAutoSelected.current && weeks.length > 0 && !weeks.includes(selectedWeek as number)) {
      hasAutoSelected.current = true;
      setSelectedWeek(weeks[0]);
      setLoading(false);
      return;
    }
    hasAutoSelected.current = true;
    const { count: totalCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('result_entered', true);
    setTotalCompleted(totalCount || 0);

    let query = supabase
      .from('matches')
      .select('*')
      .eq('result_entered', true)
      .order('kickoff_at', { ascending: true });

    if (selectedWeek !== 'all') {
      query = query.eq('week_number', selectedWeek);
    }

    const { data: matchData } = await query;

    let doubleUpIds = new Set<string>();
    const predMap = new Map<string, any>();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (selectedWeek !== 'all') {
        const duRes = await fetch(`/api/double-up?weekNumber=${selectedWeek}`);
        if (duRes.ok) {
          const duData = await duRes.json();
          if (duData.matchId) doubleUpIds = new Set([duData.matchId]);
        }
      }
      const scoredMatchIds = (matchData || []).map((m: any) => m.id);
      if (scoredMatchIds.length > 0) {
        const { data: predData } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id)
          .in('match_id', scoredMatchIds);
        for (const p of predData || []) {
          predMap.set(p.match_id, p);
        }
      }
    }
    setDoubleUpMatchIds(doubleUpIds);
    setPredictions(predMap);

    setMatches(matchData || []);
    setLoading(false);
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const weekOptions: { value: number | 'all'; label: string }[] = [
    { value: 'all', label: `All Results (${totalCompleted} matches)` },
  ];
  for (const w of availableWeeks) {
    weekOptions.push({ value: w, label: getWeekDropdownLabel(w) });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-primary">Results</h1>
            <p className="text-textMuted text-sm mt-1">Completed match scores</p>
          </div>
          <Link href="/fixtures" className="text-sm text-textMuted hover:text-primary transition-colors">
            ← Fixtures
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-surface border border-border text-text rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary"
          >
            {weekOptions.map(opt => (
              <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {selectedWeek === 'all' && matches.length > 0 && availableWeeks.length > 0 && (
            <span className="text-sm text-textMuted">
              {availableWeeks.length} week{availableWeeks.length !== 1 ? 's' : ''} · {getWeekLabel(availableWeeks[0] as number)} is latest
            </span>
          )}
          {selectedWeek !== 'all' && (
            <span className="text-sm text-textMuted">
              {getWeekRange(selectedWeek)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-textMuted">Loading...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-textMuted">No results yet for this week.</p>
            <p className="text-textMuted text-sm mt-1">Check back once matches have been played.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="card">
                <div className="flex items-center justify-between mb-4 text-xs text-textMuted">
                  <div className="flex items-center gap-2">
                    <span className="font-medium uppercase tracking-wide">{match.group_stage}</span>
                    {doubleUpMatchIds.has(match.id) && (
                      <span className="font-medium bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded-full">
                        ⭐ Double Up
                      </span>
                    )}
                  </div>
                  <span>{fmtDate(match.kickoff_at)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <TeamBadge value={match.home_flag} size="lg" />
                    <span className="font-bold text-sm text-center leading-tight">{match.home_team}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-4xl font-black text-primary">{match.home_score ?? 0}</span>
                    <span className="text-textMuted font-bold">–</span>
                    <span className="text-4xl font-black text-primary">{match.away_score ?? 0}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <TeamBadge value={match.away_flag} size="lg" />
                    <span className="font-bold text-sm text-center leading-tight">{match.away_team}</span>
                  </div>
                </div>

                {(() => {
                  const pred = predictions.get(match.id);
                  if (!pred) return null;
                  const isExact = pred.is_exact_score;
                  const isCorrect = pred.is_correct_result;
                  const isDouble = doubleUpMatchIds.has(match.id);
                  const pts = pred.points_awarded || 0;
                  return (
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-3">
                      <div className="text-center">
                        <div className="text-[10px] text-textMuted uppercase tracking-wider mb-0.5">You predicted</div>
                        <span className="text-sm font-medium">{pred.home_prediction} – {pred.away_prediction}</span>
                      </div>
                      <div className="text-center">
                        {isExact && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-medium">Exact!</span>
                        )}
                        {isCorrect && !isExact && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-medium">Correct result</span>
                        )}
                        {!isCorrect && !isExact && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-medium">Wrong</span>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-textMuted uppercase tracking-wider mb-0.5">Points</div>
                        <span className={`text-sm font-bold ${isDouble ? 'text-yellow-400' : 'text-primary'}`}>
                          +{pts} {isDouble && '⭐'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        <section className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3 text-text">How Match Results Are Scored</h2>
          <div className="text-textMuted text-sm leading-relaxed space-y-3">
            <p>
              Every Premier League match on Play Predict Win is scored automatically once the result is confirmed. You earn 3 points for an exact scoreline prediction — if you predicted 2-1 and the match ended 2-1, you get the full 3 points. If you predicted the correct result but the wrong score (say you predicted 2-1 and it ended 3-1), you receive 1 point for a correct result.
            </p>
            <p>
              Your predictions are matched against the official Premier League result, which is confirmed once the match referee signals full-time. Results are typically updated within an hour of the final whistle. If you used your Double Up on a match and it scores correctly, your points for that match are doubled — 3 points becomes 6, and 1 point becomes 2.
            </p>
            <p>
              You can view your prediction history on the Results page at any time. Use the week filter to see results for specific gameweeks, or select &quot;All Results&quot; to see your complete prediction history across the full season. Each result card shows your prediction, the official match score, and how many points you earned.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
