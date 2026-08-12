'use client';
import Footer from '@/components/Footer';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SEASON_MONTHS,
  getWeekNumber,
  getWeekRange,
  getWeekDropdownLabel,
  getMonthStart,
  getMonthEnd,
} from '@/lib/weeks';

interface MemberEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
}

export default function LeagueLeaderboardPage() {
  const params = useParams();
  const leagueId = params.id as string;
  const [league, setLeague] = useState<any>(null);
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // View mode: season / week / month
  const [mode, setMode] = useState<'season' | 'week' | 'month'>('week');

  // Week state
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber());
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  // Month state
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);

  const supabase = createClient();

  const loadAvailableWeeks = useCallback(async () => {
    const { data } = await supabase
      .from('matches')
      .select('week_number')
      .not('week_number', 'is', null)
      .eq('result_entered', true)
      .order('week_number', { ascending: false });
    const weeks = Array.from(new Set((data || []).map((m: any) => m.week_number))).sort((a, b) => b - a);
    setAvailableWeeks(weeks);
    if (weeks.length > 0 && !weeks.includes(selectedWeek)) {
      setSelectedWeek(weeks[0]);
    }
  }, [supabase, selectedWeek]);

  useEffect(() => { loadAvailableWeeks(); }, [loadAvailableWeeks]);

  useEffect(() => { loadLeagueData(); }, [leagueId]);

  useEffect(() => {
    if (league) computeMemberScores();
  }, [mode, selectedWeek, selectedMonthIdx, league]);

  async function loadLeagueData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (!leagueData) return;
    setLeague(leagueData);

    const { data: membership } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)
      .single();

    if (!membership) return;
  }

  async function computeMemberScores() {
    if (!league) return;
    setLoading(true);

    const { data: memberList } = await supabase
      .from('league_members')
      .select('user_id')
      .eq('league_id', leagueId);

    if (!memberList) { setLoading(false); return; }

    let matchIds: string[] = [];

    if (mode === 'week') {
      const { data } = await supabase
        .from('matches')
        .select('id')
        .eq('week_number', selectedWeek)
        .eq('result_entered', true);
      matchIds = (data || []).map((m: any) => m.id);
    } else if (mode === 'month') {
      const sm = SEASON_MONTHS[selectedMonthIdx];
      const monthStart = getMonthStart(sm.year, sm.month).toISOString();
      const monthEnd   = getMonthEnd(sm.year, sm.month).toISOString();
      const { data } = await supabase
        .from('matches')
        .select('id')
        .gte('kickoff_at', monthStart)
        .lte('kickoff_at', monthEnd)
        .eq('result_entered', true);
      matchIds = (data || []).map((m: any) => m.id);
    }
    // For 'season' mode, matchIds stays empty = all scored predictions

    const enriched = await Promise.all((memberList || []).map(async (m: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', m.user_id)
        .single();

      let query = supabase
        .from('predictions')
        .select('points_awarded, is_exact_score, is_correct_result')
        .eq('user_id', m.user_id)
        .not('scored_at', 'is', null);

      if (mode !== 'season' && matchIds.length > 0) {
        query = query.in('match_id', matchIds);
      }

      const { data: scored } = await query;

      const totalPoints = (scored || []).reduce((s: number, p: any) => s + (p.points_awarded || 0), 0);
      const exactScores = (scored || []).filter((p: any) => p.is_exact_score).length;
      const correctResults = (scored || []).filter((p: any) => p.is_correct_result && !p.is_exact_score).length;
      const totalPreds = (scored || []).length;

      return {
        user_id: m.user_id,
        username: profile?.username || 'Unknown',
        avatar_url: profile?.avatar_url || null,
        total_points: totalPoints,
        exact_scores: exactScores,
        correct_results: correctResults,
        total_predictions: totalPreds,
      };
    }));

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores);
    setMembers(enriched);
    setLoading(false);
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-textMuted">Loading...</div>
      </div>
    );
  }

  const myIndex = members.findIndex(m => m.user_id === currentUserId);
  const currentMonth = SEASON_MONTHS[selectedMonthIdx];

  const modeLabel = mode === 'week' ? `Week ${selectedWeek}` : mode === 'month' ? currentMonth.label : 'Season';

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link href="/leagues" className="text-textMuted hover:text-text transition-colors">← Leagues</Link>
          <span className="text-textMuted">/</span>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🏆</span> {league?.name}
          </h1>
          {league?.is_public && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Public</span>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex bg-surfaceLight rounded-xl p-1 gap-1">
            <button
              onClick={() => { setMode('week'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'week' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
              }`}
            >
              🗓️ Weekly
            </button>
            <button
              onClick={() => { setMode('month'); setSelectedMonthIdx(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'month' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => { setMode('season'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'season' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
              }`}
            >
              🏆 Season
            </button>
          </div>

          {mode === 'week' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-textMuted">Week:</label>
              <select
                value={selectedWeek}
                onChange={e => setSelectedWeek(Number(e.target.value))}
                className="input py-1.5 text-sm"
              >
                {availableWeeks.map(w => (
                  <option key={w} value={w}>{getWeekDropdownLabel(w)}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'month' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-textMuted">Month:</label>
              <select
                value={selectedMonthIdx}
                onChange={e => setSelectedMonthIdx(Number(e.target.value))}
                className="input py-1.5 text-sm"
              >
                {SEASON_MONTHS.map((sm, i) => (
                  <option key={i} value={i}>{sm.label}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'week' && (
            <span className="text-xs text-textMuted">{getWeekRange(selectedWeek)}</span>
          )}
          {mode === 'month' && (
            <span className="text-xs text-textMuted">{currentMonth.label}</span>
          )}
          {mode === 'season' && (
            <span className="text-xs text-textMuted">All predictions across the full season</span>
          )}
        </div>

        {/* My Rank Summary */}
        {myIndex >= 0 && (
          <div className="card mb-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-textMuted text-sm">{modeLabel} Position</p>
                <p className="text-3xl font-bold">
                  {myIndex + 1}
                  <span className="text-textMuted text-lg font-normal"> / {members.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Points</p>
                <p className="text-2xl font-bold text-primary">{members[myIndex].total_points}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Exact Scores</p>
                <p className="text-2xl font-bold text-warning">{members[myIndex].exact_scores}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Correct Results</p>
                <p className="text-2xl font-bold">{members[myIndex].correct_results}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-textMuted">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-textMuted">
                {mode === 'week' ? `No predictions for Week ${selectedWeek} yet` :
                 mode === 'month' ? `No predictions for ${currentMonth.label} yet` :
                 'No predictions yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-textMuted font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-textMuted font-medium">Player</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Points</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Exact</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Results</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr
                    key={member.user_id}
                    className={`border-b border-border/50 transition-colors ${
                      member.user_id === currentUserId ? 'bg-primary/10' : 'hover:bg-surfaceLight/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && <span className="text-textMuted">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={member.avatar_url || '/default-avatar.png'}
                          alt={member.username}
                          className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className={`font-medium truncate max-w-[120px] ${member.user_id === currentUserId ? 'text-primary' : ''}`}>
                            {member.username}
                          </span>
                          {member.user_id === currentUserId && (
                            <span className="text-xs text-primary">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xl font-bold text-primary">{member.total_points}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-warning font-medium">{member.exact_scores}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-textMuted">{member.correct_results}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invite friends */}
        <div className="mt-6 card text-center">
          <p className="text-textMuted mb-3">Invite friends to this league</p>
          <div className="flex items-center justify-center gap-3">
            <code className="bg-surfaceLight px-4 py-2 rounded-lg font-mono text-primary text-lg">
              {league?.code}
            </code>
            <button
              onClick={() => {
                const url = `${window.location.origin}/leagues?join=${league?.code}`;
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="btn-secondary text-sm"
            >
              {copied ? '✅ Copied!' : '📋 Copy Invite Link'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
