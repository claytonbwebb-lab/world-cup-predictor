'use client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

import { SEASON_START, SEASON_MONTHS, getWeekRange, getWeekDropdownLabel, getMonthStart, getMonthEnd } from '@/lib/weeks';

const PAGE_SIZE = 25;

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_predictions: number;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (currentPage > 4) pages.push('ellipsis');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (currentPage < totalPages - 3) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<'season' | 'week' | 'month'>('week');
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [mode, selectedWeek, selectedMonthIdx, currentPage]);

  async function loadLeaderboard() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id ?? null;

    // Fetch distinct week numbers from matches
    const { data: weekData } = await supabase
      .from('matches')
      .select('week_number')
      .not('week_number', 'is', null)
      .eq('result_entered', true)
      .order('week_number', { ascending: false });
    const weeks = Array.from(new Set((weekData || []).map((m: { week_number: number }) => m.week_number))).sort((a, b) => b - a);
    setAvailableWeeks(weeks);
    if (weeks.length > 0 && selectedWeek === 1 && !weeks.includes(1)) {
      setSelectedWeek(weeks[0]);
    }

    if (mode === 'season') {
      await loadSeasonLeaderboard(currentUserId);
    } else if (mode === 'week') {
      await loadWeeklyLeaderboard(currentUserId, selectedWeek);
    } else {
      await loadMonthlyLeaderboard(currentUserId, selectedMonthIdx);
    }
    setLoading(false);
  }

  async function loadSeasonLeaderboard(currentUserId: string | null) {
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('id', 'eq', '00000000-0000-0000-0000-000000000000');

    if (!allUsers) return;

    const enriched: LeaderboardEntry[] = await Promise.all(allUsers.map(async (profile) => {
      const { data: scored } = await supabase
        .from('predictions')
        .select('points_awarded, is_exact_score, is_correct_result')
        .eq('user_id', profile.id)
        .not('scored_at', 'is', null);

      const pts = (scored || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
      const exact = (scored || []).filter(p => p.is_exact_score).length;
      const correct = (scored || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
      const total = (scored || []).length;
      return {
        user_id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        total_points: pts,
        exact_scores: exact,
        correct_results: correct,
        total_predictions: total,
      };
    }));

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results);
    const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    setEntries(enriched.slice(offset, offset + PAGE_SIZE));
    setTotalCount(enriched.length);
    setCurrentPage(page);
    const rank = currentUserId ? enriched.findIndex(e => e.user_id === currentUserId) : -1;
    setUserRank(rank >= 0 ? rank + 1 : null);
    setUserEntry(currentUserId ? enriched.find(e => e.user_id === currentUserId) || null : null);
  }

  async function loadWeeklyLeaderboard(currentUserId: string | null, weekNum: number) {
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('id', 'eq', '00000000-0000-0000-0000-000000000000');

    if (!allUsers) return;

    const { data: weekMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('week_number', weekNum)
      .eq('result_entered', true);

    const matchIds = (weekMatches || []).map(m => m.id);

    const enriched: LeaderboardEntry[] = await Promise.all(allUsers.map(async (profile) => {
      if (matchIds.length === 0) {
        return {
          user_id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          total_points: 0, exact_scores: 0, correct_results: 0, total_predictions: 0,
        };
      }
      const { data: scored } = await supabase
        .from('predictions')
        .select('points_awarded, is_exact_score, is_correct_result')
        .eq('user_id', profile.id)
        .in('match_id', matchIds)
        .not('scored_at', 'is', null);

      const pts = (scored || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
      const exact = (scored || []).filter(p => p.is_exact_score).length;
      const correct = (scored || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
      const total = (scored || []).length;
      return {
        user_id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        total_points: pts,
        exact_scores: exact,
        correct_results: correct,
        total_predictions: total,
      };
    }));

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results);
    const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    setEntries(enriched.slice(offset, offset + PAGE_SIZE));
    setTotalCount(enriched.length);
    setCurrentPage(page);
    const rank = currentUserId ? enriched.findIndex(e => e.user_id === currentUserId) : -1;
    setUserRank(rank >= 0 ? rank + 1 : null);
    setUserEntry(currentUserId ? enriched.find(e => e.user_id === currentUserId) || null : null);
  }

  async function loadMonthlyLeaderboard(currentUserId: string | null, monthIdx: number) {
    const sm = SEASON_MONTHS[monthIdx];
    const monthStart = getMonthStart(sm.year, sm.month).toISOString();
    const monthEnd   = getMonthEnd(sm.year, sm.month).toISOString();

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('id', 'eq', '00000000-0000-0000-0000-000000000000');

    if (!allUsers) return;

    const { data: monthMatches } = await supabase
      .from('matches')
      .select('id')
      .gte('kickoff_at', monthStart)
      .lte('kickoff_at', monthEnd)
      .eq('result_entered', true);

    const matchIds = (monthMatches || []).map(m => m.id);

    const enriched: LeaderboardEntry[] = await Promise.all(allUsers.map(async (profile) => {
      if (matchIds.length === 0) {
        return { user_id: profile.id, username: profile.username, avatar_url: profile.avatar_url,
          total_points: 0, exact_scores: 0, correct_results: 0, total_predictions: 0 };
      }
      const { data: scored } = await supabase
        .from('predictions')
        .select('points_awarded, is_exact_score, is_correct_result')
        .eq('user_id', profile.id)
        .in('match_id', matchIds)
        .not('scored_at', 'is', null);

      const pts = (scored || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
      const exact = (scored || []).filter(p => p.is_exact_score).length;
      const correct = (scored || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
      const total = (scored || []).length;
      return { user_id: profile.id, username: profile.username, avatar_url: profile.avatar_url,
        total_points: pts, exact_scores: exact, correct_results: correct, total_predictions: total };
    }));

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results);
    const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    setEntries(enriched.slice(offset, offset + PAGE_SIZE));
    setTotalCount(enriched.length);
    setCurrentPage(page);
    const rank = currentUserId ? enriched.findIndex(e => e.user_id === currentUserId) : -1;
    setUserRank(rank >= 0 ? rank + 1 : null);
    setUserEntry(currentUserId ? enriched.find(e => e.user_id === currentUserId) || null : null);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build week selector options
  const weekOptions = [];
  for (const w of availableWeeks) {
    weekOptions.push({ value: w, label: getWeekDropdownLabel(w) });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <span>🥇</span> Leaderboard
        </h1>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex bg-surfaceLight rounded-xl p-1 gap-1">
            <button
              onClick={() => { setMode('week'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'week' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
              }`}
            >
              🗓️ Weekly
            </button>
            <button
              onClick={() => { setMode('month'); setCurrentPage(1); setSelectedMonthIdx(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'month' ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => { setMode('season'); setCurrentPage(1); }}
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
                onChange={e => { setSelectedWeek(Number(e.target.value)); setCurrentPage(1); }}
                className="input py-1.5 text-sm"
              >
                {weekOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'month' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-textMuted">Month:</label>
              <select
                value={selectedMonthIdx}
                onChange={e => { setSelectedMonthIdx(Number(e.target.value)); setCurrentPage(1); }}
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
            <span className="text-xs text-textMuted">{SEASON_MONTHS[selectedMonthIdx].label}</span>
          )}
          {mode === 'season' && (
            <span className="text-xs text-textMuted">All scored predictions across the full season</span>
          )}
        </div>

        {/* User's Rank Summary */}
        {userEntry && userRank && (
          <div className="card mb-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-textMuted text-sm">
                  {mode === 'week' ? getWeekRange(selectedWeek) : mode === 'month' ? SEASON_MONTHS[selectedMonthIdx].label : 'Season'} Position
                </p>
                <p className="text-3xl font-bold">
                  {userRank}
                  <span className="text-textMuted text-lg font-normal"> / {totalCount}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Total Points</p>
                <p className="text-2xl font-bold text-primary">{userEntry.total_points}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Exact Scores</p>
                <p className="text-2xl font-bold text-warning">{userEntry.exact_scores}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Correct Results</p>
                <p className="text-2xl font-bold">{userEntry.correct_results}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-16 text-textMuted">Loading...</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-textMuted font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-textMuted font-medium">Player</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Points</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Exact</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Results</th>
                  <th className="text-center py-3 px-4 text-textMuted font-medium">Preds</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const rank = (currentPage - 1) * PAGE_SIZE + index + 1;
                  return (
                    <tr
                      key={entry.user_id}
                      className={`border-b border-border/50 hover:bg-surfaceLight/50 transition-colors ${
                        entry.user_id === userId ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-8">
                          {rank === 1 && <span className="text-2xl">🥇</span>}
                          {rank === 2 && <span className="text-2xl">🥈</span>}
                          {rank === 3 && <span className="text-2xl">🥉</span>}
                          {rank > 3 && <span className="text-textMuted">{rank}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.avatar_url || '/default-avatar.png'}
                            alt={entry.username}
                            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className={`font-medium truncate max-w-[120px] ${entry.user_id === userId ? 'text-primary' : ''}`}>
                              {entry.username}
                            </span>
                            {entry.user_id === userId && (
                              <span className="text-xs text-primary">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xl font-bold text-primary">{entry.total_points}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-warning font-medium">{entry.exact_scores}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-textMuted">{entry.correct_results}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-textMuted">{entry.total_predictions}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {entries.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <p className="text-textMuted">
                  {mode === 'week' ? `No predictions for Week ${selectedWeek} yet` :
                   mode === 'month' ? `No predictions for ${SEASON_MONTHS[selectedMonthIdx].label} yet` :
                   'No predictions scored yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Leaderboard pages">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Previous
            </button>
            {getVisiblePages(currentPage, totalPages).map((page, i) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-textMuted">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface hover:bg-surfaceLight text-text'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Next
            </button>
            <span className="w-full text-center text-sm text-textMuted sm:w-auto sm:pl-2">
              {totalCount} players
            </span>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
