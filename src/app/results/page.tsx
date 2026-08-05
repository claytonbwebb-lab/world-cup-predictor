'use client';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import TeamBadge from '@/components/TeamBadge';

// Season start date: Tuesday 2026-08-11 (00:00)
const SEASON_START = new Date('2026-08-11T00:00:00Z');

function getWeekLabel(weekNumber: number): string {
  return `Week ${weekNumber}`;
}

function getWeekRange(weekNumber: number): string {
  const start = new Date(SEASON_START);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

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

export default function ResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [doubleUpMatchIds, setDoubleUpMatchIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => { load(); }, [selectedWeek]);

  async function load() {
    setLoading(true);

    // Fetch distinct week numbers from completed matches
    const { data: weekData } = await supabase
      .from('matches')
      .select('week_number')
      .eq('result_entered', true)
      .not('week_number', 'is', null)
      .order('week_number', { ascending: false });
    const weeks = Array.from(new Set((weekData || []).map((m: { week_number: number }) => m.week_number))).sort((a, b) => b - a);
    setAvailableWeeks(weeks);

    let query = supabase
      .from('matches')
      .select('*')
      .eq('result_entered', true)
      .order('kickoff_at', { ascending: true });

    if (selectedWeek !== 'all') {
      query = query.eq('week_number', selectedWeek);
    }

    const { data: matchData } = await query;

    // Fetch user's Double Up picks for the selected week
    let doubleUpIds = new Set<string>();
    if (selectedWeek !== 'all') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: picks } = await supabase
          .from('double_up_picks')
          .select('match_id')
          .eq('user_id', user.id)
          .eq('week_number', selectedWeek);
        doubleUpIds = new Set((picks || []).map(p => p.match_id));
      }
    }
    setDoubleUpMatchIds(doubleUpIds);

    setMatches(matchData || []);
    setLoading(false);
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  // Build week options for selector
  const weekOptions: { value: number | 'all'; label: string }[] = [
    { value: 'all', label: `All Results (${matches.length} matches)` },
  ];
  for (const w of availableWeeks) {
    weekOptions.push({ value: w, label: `${getWeekLabel(w)} — ${getWeekRange(w)}` });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-primary">Results</h1>
            <p className="text-textMuted text-sm mt-1">Completed match scores</p>
          </div>
          <Link href="/fixtures" className="text-sm text-textMuted hover:text-primary transition-colors">
            ← Fixtures
          </Link>
        </div>

        {/* Week filter */}
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
              {availableWeeks.length} week{availableWeeks.length !== 1 ? 's' : ''} · {getWeekLabel(availableWeeks[0])} is latest
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
                {/* Meta row */}
                <div className="flex items-center justify-between mb-4 text-xs text-textMuted">
                  <div className="flex items-center gap-2">
                    {match.week_number && (
                      <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Week {match.week_number}
                      </span>
                    )}
                    <span className="font-medium uppercase tracking-wide">{match.group_stage}</span>
                    {doubleUpMatchIds.has(match.id) && (
                      <span className="font-medium bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded-full">
                        ⭐ Double Up
                      </span>
                    )}
                  </div>
                  <span>{fmtDate(match.kickoff_at)}</span>
                </div>

                {/* Score row */}
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
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
