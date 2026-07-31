'use client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

// Season start: Tuesday 2026-08-11 00:00 UTC
const SEASON_START = new Date('2026-08-11T00:00:00Z');

function getWeekNumber(date: Date = new Date()): number {
  const diffMs = date.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}

function getWeekRange(weekNumber: number): string {
  const start = new Date(SEASON_START);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

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
  const [mode, setMode] = useState<'season' | 'week'>('week');
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
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
  }, [mode, selectedWeek, currentPage]);

  async function loadLeaderboard() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Fetch distinct week numbers from matches
    const { data: weekData } = await supabase
      .from('matches')
      .select('week_number')
      .not('week_number', 'is', null)
      .eq('result_entered', true)
      .order('week_number', { ascending: false });
    const weeks = [...new Set((weekData || []).map((m: { week_number: number }) => m.week_number))].sort((a, b) => b - a);
    setAvailableWeeks(weeks);
    if (weeks.length > 0 && selectedWeek === 1 && !weeks.includes(1)) {
      setSelectedWeek(weeks[0]);
    }

    if (mode === 'season') {
      await loadSeasonLeaderboard(user.id);
    } else {
      await loadWeeklyLeaderboard(user.id, selectedWeek);
    }
    setLoading(false);
  }

  async function loadSeasonLeaderboard(currentUserId: string) {
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

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores);
    const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    setEntries(enriched.slice(offset, offset + PAGE_SIZE));
    setTotalCount(enriched.length);
    setCurrentPage(page);
    const rank = enriched.findIndex(e => e.user_id === currentUserId);
    setUserRank(rank >= 0 ? rank + 1 : null);
    setUserEntry(enriched.find(e => e.user_id === currentUserId) || null);
  }

  async function loadWeeklyLeaderboard(currentUserId: string, weekNum: number) {
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

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores);
    const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;
    setEntries(enriched.slice(offset, offset + PAGE_SIZE));
    setTotalCount(enriched.length);
    setCurrentPage(page);
    const rank = enriched.findIndex(e => e.user_id === currentUserId);
    setUserRank(rank >= 0 ? rank + 1 : null);
    setUserEntry(enriched.find(e => e.user_id === currentUserId) || null);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build week selector options
  const weekOptions = [];
  for (const w of availableWeeks) {
    weekOptions.push({ value: w, label: `Week ${w} — ${getWeekRange(w)}` });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <span>🥇</span> Leaderboard
        </h1>

        {/* Prizes banner */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { pos: '🥇 1st', prize: '£250', bg: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/40 text-yellow-400' },
            { pos: '🥈 2nd', prize: '£100', bg: 'from-gray-400/10 to-gray-500/5 border-gray-400/30 text-gray-300' },
            { pos: '🥉 3rd', prize: '£50', bg: 'from-orange-600/10 to-orange-700/5 border-orange-600/30 text-orange-400' },
          ].map(p => (
            <div key={p.pos} className={`flex items-center gap-2 border rounded-xl px-5 py-2 bg-gradient-to-r ${p.bg}`}>
              <span className="font-bold text-sm">{p.pos}</span>
              <span className="font-black text-lg">{p.prize}</span>
            </div>
          ))}
        </div>

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

          {mode === 'week' && (
            <span className="text-xs text-textMuted">{getWeekRange(selectedWeek)}</span>
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
                  {mode === 'week' ? `Week ${selectedWeek}` : 'Season'} Position
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
          <div className="card overflow-hidden">
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
                          <div className="flex flex-col">
                            <span className={`font-medium ${entry.user_id === userId ? 'text-primary' : ''}`}>
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
                  {mode === 'week' ? `No predictions for Week ${selectedWeek} yet` : 'No predictions scored yet'}
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