'use client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { SEASON_MONTHS, getWeekDropdownLabel } from '@/lib/weeks';

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

// Prize config per mode
const PRIZES: Record<string, string[]> = {
  week: ['£50'],
  month: ['£100', '£50', '£25'],
  season: ['£500', '£250', '£100'],
};

export default function TestLeaderboardPage() {
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

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results || a.user_id.localeCompare(b.user_id));
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

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results || a.user_id.localeCompare(b.user_id));
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
    const monthStart = new Date(sm.year, sm.month, 1).toISOString();
    const monthEnd = new Date(sm.year, sm.month + 1, 0, 23, 59, 59).toISOString();

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

    enriched.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores || b.correct_results - a.correct_results || a.user_id.localeCompare(b.user_id));
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
  const weekOptions = availableWeeks.map(w => ({ value: w, label: getWeekDropdownLabel(w) }));
  const prizes = PRIZES[mode];

  // Top 3 for podium
  const topThree = entries.slice(0, 3);
  while (topThree.length < 3) {
    topThree.push({ user_id: `empty-${topThree.length}`, username: '-', avatar_url: null, total_points: 0, exact_scores: 0, correct_results: 0, total_predictions: 0 });
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
        </div>

        {/* Prize Money Display */}
        <div className="card mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="text-center">
            <p className="text-sm text-amber-700 font-medium mb-2">🏆 Prize Money</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {prizes.map((amount, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-xl font-black text-amber-800">{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Olympic Podium - Top 3 */}
        {!loading && totalCount > 0 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-3 sm:gap-6">
              {/* 2nd place - left */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-slate-300 shadow-lg bg-surface">
                    {topThree[1].avatar_url ? (
                      <img src={topThree[1].avatar_url} alt={topThree[1].username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl">🥈</div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">2</div>
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-sm truncate max-w-[100px] sm:max-w-[120px]">{topThree[1].username}</p>
                  <p className="text-xs text-textMuted">{topThree[1].total_points} pts</p>
                  {prizes[1] && <p className="text-sm font-black text-slate-600">{prizes[1]}</p>}
                </div>
                {/* Podium block */}
                <div className="w-24 sm:w-32 h-20 bg-gradient-to-t from-slate-300 to-slate-200 rounded-b-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-black text-slate-500">2</span>
                </div>
              </div>

              {/* 1st place - center */}
              <div className="flex flex-col items-center -mt-6">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-surface">
                    {topThree[0].avatar_url ? (
                      <img src={topThree[0].avatar_url} alt={topThree[0].username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-100 flex items-center justify-center text-4xl">🥇</div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">1</div>
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-base truncate max-w-[120px] sm:max-w-[160px]">{topThree[0].username}</p>
                  <p className="text-xs text-textMuted">{topThree[0].total_points} pts</p>
                  {prizes[0] && <p className="text-lg font-black text-amber-600">{prizes[0]}</p>}
                </div>
                {/* Podium block - tallest */}
                <div className="w-28 sm:w-36 h-32 bg-gradient-to-t from-amber-400 to-amber-300 rounded-b-lg mt-2 flex items-center justify-center">
                  <span className="text-4xl font-black text-amber-700">1</span>
                </div>
              </div>

              {/* 3rd place - right */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-600 shadow-lg bg-surface">
                    {topThree[2].avatar_url ? (
                      <img src={topThree[2].avatar_url} alt={topThree[2].username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center text-3xl">🥉</div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">3</div>
                </div>
                <div className="mt-2 text-center">
                  <p className="font-bold text-sm truncate max-w-[100px] sm:max-w-[120px]">{topThree[2].username}</p>
                  <p className="text-xs text-textMuted">{topThree[2].total_points} pts</p>
                  {prizes[2] && <p className="text-sm font-black text-amber-700">{prizes[2]}</p>}
                </div>
                {/* Podium block */}
                <div className="w-24 sm:w-32 h-16 bg-gradient-to-t from-amber-600 to-amber-500 rounded-b-lg mt-2 flex items-center justify-center">
                  <span className="text-3xl font-black text-amber-800">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User's Rank Summary */}
        {userEntry && userRank && (
          <div className="card mb-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-textMuted text-sm">
                  {mode === 'week' ? getWeekDropdownLabel(selectedWeek) : mode === 'month' ? SEASON_MONTHS[selectedMonthIdx].label : 'Season'} Position
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
