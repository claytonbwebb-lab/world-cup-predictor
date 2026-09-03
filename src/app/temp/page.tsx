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
            {(['week', 'month', 'season'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setCurrentPage(1); if (m === 'month') setSelectedMonthIdx(0); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-primary text-white shadow' : 'text-textMuted hover:text-text'
                }`}
              >
                {m === 'week' ? '🗓️ Weekly' : m === 'month' ? '📅 Monthly' : '🏆 Season'}
              </button>
            ))}
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

        {/* === Social-Style Podium === */}
        {!loading && totalCount > 0 && (
          <div className="mb-8 relative overflow-hidden rounded-2xl" style={{
            background: 'linear-gradient(180deg, #0a0e27 0%, #1a1f4b 50%, #0a0e27 100%)',
          }}>
            {/* Stadium lights */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            
            {/* Title */}
            <div className="text-center pt-6 pb-2 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">
                {mode === 'week' ? 'Weekly' : mode === 'month' ? 'Monthly' : 'Season'} Winners!
              </h2>
              <p className="text-white/60 text-sm mt-1">Top Predictors {mode === 'season' ? 'This Season' : mode === 'month' ? 'This Month' : 'This Week'}</p>
            </div>
            
            {/* Podiums */}
            <div className="flex items-end justify-center gap-2 sm:gap-6 px-4 pb-4 pt-6 relative z-10">
              {/* 2nd */}
              <SocialPodium entry={topThree[1]} rank={2} prize={prizes[1]} hasData={entries.length >= 2} />
              {/* 1st */}
              <SocialPodium entry={topThree[0]} rank={1} prize={prizes[0]} hasData={true} isCenter />
              {/* 3rd */}
              <SocialPodium entry={topThree[2]} rank={3} prize={prizes[2]} hasData={entries.length >= 3} />
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
                        <span className="text-textMuted w-8 inline-block text-center">{rank}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={entry.avatar_url || '/default-avatar.png'}
                            alt={entry.username}
                            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          />
                          <span className={`font-medium truncate max-w-[120px] ${entry.user_id === userId ? 'text-primary' : ''}`}>
                            {entry.username}
                          </span>
                          {entry.user_id === userId && <span className="text-xs text-primary">You</span>}
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

// === Social Media Style Podium Component ===
function SocialPodium({
  entry,
  prize,
  hasData,
  rank,
  isCenter = false,
}: {
  entry: LeaderboardEntry;
  prize?: string;
  hasData: boolean;
  rank: number;
  isCenter?: boolean;
}) {
  const configs: Record<number, {
    ring: string;
    bg: string;
    blockGradient: string;
    label: string;
    textColor: string;
    blockHeight: string;
    avatarSize: string;
    translateY: string;
  }> = {
    1: {
      ring: 'border-[#FFD700]',
      bg: 'bg-[#FFD700]',
      blockGradient: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 100%)',
      label: '1',
      textColor: 'text-[#1a1a1a]',
      blockHeight: 'h-28 sm:h-36',
      avatarSize: 'w-20 h-20 sm:w-28 sm:h-28',
      translateY: '-translate-y-4',
    },
    2: {
      ring: 'border-[#C0C0C0]',
      bg: 'bg-[#C0C0C0]',
      blockGradient: 'linear-gradient(180deg, #C0C0C0 0%, #A8A8A8 100%)',
      label: '2',
      textColor: 'text-[#1a1a1a]',
      blockHeight: 'h-20 sm:h-28',
      avatarSize: 'w-18 h-18 sm:w-24 sm:h-24',
      translateY: '',
    },
    3: {
      ring: 'border-[#CD7F32]',
      bg: 'bg-[#CD7F32]',
      blockGradient: 'linear-gradient(180deg, #CD7F32 0%, #A0522D 100%)',
      label: '3',
      textColor: 'text-[#1a1a1a]',
      blockHeight: 'h-16 sm:h-24',
      avatarSize: 'w-18 h-18 sm:w-24 sm:h-24',
      translateY: '',
    },
  };

  const cfg = configs[rank];

  return (
    <div className={`flex flex-col items-center ${isCenter ? cfg.translateY : ''} w-[110px] sm:w-[160px]`}>
      {/* Medal Badge */}
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${cfg.bg} flex items-center justify-center shadow-lg mb-1 z-20`}>
        <span className="font-black text-sm sm:text-base text-white">{cfg.label}</span>
      </div>

      {/* Avatar with ring */}
      <div className={`${cfg.avatarSize} rounded-full overflow-hidden border-3 sm:border-4 ${cfg.ring} shadow-xl bg-[#1a1f4b] relative`}>
        {hasData && entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
        ) : hasData ? (
          <div className="w-full h-full bg-[#2a3060] flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        ) : (
          <div className="w-full h-full bg-[#2a3060] flex items-center justify-center">
            <span className="text-xl text-white/40">–</span>
          </div>
        )}
      </div>

      {/* Name badge */}
      <div className="mt-2 w-full">
        <div className="bg-[#1a1f4b]/80 border border-white/10 rounded-lg px-2 py-1 text-center">
          <p className="font-bold text-white text-xs sm:text-sm truncate">{hasData ? entry.username : '–'}</p>
        </div>
      </div>

      {/* Points badge */}
      {hasData && (
        <div className="mt-1.5 bg-[#7ED321] rounded-md px-3 py-0.5 shadow-lg">
          <span className="font-black text-[#1a1a1a] text-sm sm:text-base">{entry.total_points}</span>
          <span className="text-[#1a1a1a] text-[10px] font-bold ml-0.5">POINTS</span>
        </div>
      )}

      {/* Prize on podium */}
      {hasData && prize && (
        <div className="mt-1.5 text-center">
          <span className="font-black text-[#FFD700] text-lg sm:text-2xl drop-shadow-lg">{prize}</span>
          <p className="text-white/60 text-[10px] sm:text-xs font-bold">WINNER PRIZE!</p>
        </div>
      )}

      {/* Stats bar */}
      {hasData && (
        <div className="mt-1.5 flex gap-1">
          {[
            { label: 'EXACT', value: entry.exact_scores },
            { label: 'RESULTS', value: entry.correct_results },
            { label: 'PREDS', value: entry.total_predictions },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1f4b]/60 rounded px-1.5 py-0.5 text-center min-w-[32px]">
              <p className="text-white/40 text-[8px] sm:text-[9px] font-bold">{stat.label}</p>
              <p className="text-white text-xs font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Podium block */}
      <div
        className={`w-full ${cfg.blockHeight} rounded-t-lg mt-3 flex items-center justify-center shadow-inner`}
        style={{ background: cfg.blockGradient }}
      >
        <span className={`font-black text-3xl sm:text-4xl ${cfg.textColor} opacity-60`}>{rank}</span>
      </div>
    </div>
  );
}
