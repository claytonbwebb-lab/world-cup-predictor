import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import VipJoinClient from './VipJoinClient';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  is_current_user?: boolean;
}

async function getUserPoints(userId: string): Promise<number> {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: predictions } = await service
    .from('predictions')
    .select('points_awarded')
    .eq('user_id', userId)
    .not('scored_at', 'is', null);

  return (predictions || []).reduce((sum, p) => sum + (p.points_awarded || 0), 0);
}

async function getVipLeaderboard(userId: string | null): Promise<{
  entries: LeaderboardEntry[];
  userPoints: number;
  userRank: number;
  isMember: boolean;
  vipLeagueId: string | null;
}> {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const vipLeagueId = process.env.VIP_LEAGUE_ID;

  if (!vipLeagueId) {
    return { entries: [], userPoints: 0, userRank: 0, isMember: false, vipLeagueId: null };
  }

  // Get all VIP league members
  const { data: members } = await service
    .from('league_members')
    .select('user_id, profiles(username, avatar_url)')
    .eq('league_id', vipLeagueId);

  if (!members || members.length === 0) {
    // No VIP members yet — if the current user is not a member, show them alone in the leaderboard
    if (userId) {
      const userPoints = await getUserPoints(userId);
      const { data: profile } = await service
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      return {
        entries: [{
          user_id: userId,
          username: (profile as any)?.username || userId.split('-')[0],
          avatar_url: (profile as any)?.avatar_url || null,
          total_points: userPoints,
          is_current_user: true,
        }],
        userPoints,
        userRank: 1,
        isMember: false,
        vipLeagueId,
      };
    }
    return { entries: [], userPoints: 0, userRank: 0, isMember: false, vipLeagueId };
  }

  // Get predictions for all VIP members
  const memberIds = members.map(m => m.user_id);
  const { data: predictions } = await service
    .from('predictions')
    .select('user_id, points_awarded')
    .in('user_id', memberIds)
    .not('scored_at', 'is', null);

  const pointsMap: Record<string, number> = {};
  for (const pred of predictions || []) {
    pointsMap[pred.user_id] = (pointsMap[pred.user_id] || 0) + (pred.points_awarded || 0);
  }

  let entries: LeaderboardEntry[] = members.map(m => ({
    user_id: m.user_id,
    username: (m.profiles as any)?.username || 'Unknown',
    avatar_url: (m.profiles as any)?.avatar_url || null,
    total_points: pointsMap[m.user_id] || 0,
    is_current_user: false,
  }));

  // Check if current user is a member
  const isMember = userId ? members.some(m => m.user_id === userId) : false;

  let userPoints = 0;

  if (userId) {
    if (isMember) {
      userPoints = pointsMap[userId] || 0;
      // Mark current user's entry
      entries = entries.map(e =>
        e.user_id === userId ? { ...e, is_current_user: true } : e
      );
    } else {
      // Non-member: add their entry and insert into the sorted list
      userPoints = await getUserPoints(userId);
      const { data: profile } = await service
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      const myEntry: LeaderboardEntry = {
        user_id: userId,
        username: (profile as any)?.username || userId.split('-')[0],
        avatar_url: (profile as any)?.avatar_url || null,
        total_points: userPoints,
        is_current_user: true,
      };
      // Insert in sorted position
      const insertAt = entries.findIndex(e => e.total_points < userPoints);
      if (insertAt === -1) {
        entries = [...entries, myEntry];
      } else {
        entries = [...entries.slice(0, insertAt), myEntry, ...entries.slice(insertAt)];
      }
    }
  }

  entries.sort((a, b) => b.total_points - a.total_points);

  const userRank = userId
    ? entries.findIndex(e => e.user_id === userId) + 1
    : 0;

  return { entries, userPoints, userRank, isMember, vipLeagueId };
}

const MEDALS = ['🥇', '🥈', '🥉'];

interface Props {
  searchParams: Promise<{ join?: string }>;
}

export default async function VipLeaguePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const params = await searchParams;
  const joinCode = params.join?.toUpperCase() || null;

  const { entries, userPoints, userRank, isMember } = await getVipLeaderboard(user?.id || null);

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900/30 via-bg to-amber-600/10 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm text-amber-400 mb-6">
            <span>⭐</span> VIP League
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4">
            The VIP League
          </h1>
          <p className="text-lg text-textMuted max-w-2xl mx-auto mb-6">
            An exclusive prediction league for invited guests — journalists, ex-players, and special friends.
            Publicly visible, privately competitive.
          </p>
          {user && !isMember && (
            <div className="bg-surface border border-amber-500/30 rounded-xl p-4 max-w-sm mx-auto mb-6">
              <p className="text-sm text-textMuted mb-3">
                You have an invite — join the VIP league and see how you stack up against our exclusive lineup.
              </p>
              <VipJoinClient joinCode={joinCode} />
            </div>
          )}
          {user && isMember && (
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-5 py-2 text-amber-400 font-medium">
              <span>⭐</span> You&apos;re in the VIP League
            </div>
          )}
          {!user && (
            <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
              Sign up to join the competition →
            </Link>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-textPrimary mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Invite only', desc: 'The VIP League is by invitation only. If you have a link, you&apos;re on the guest list.' },
            { step: '2', title: 'Predict & score', desc: 'Make your Premier League predictions each week. Points are tallied against the rest of the league.' },
            { step: '3', title: 'Climb the board', desc: 'See where you stand among the VIPs. The leaderboard updates after every match week.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-surface border border-border rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm mb-3">{step}</div>
              <h3 className="font-semibold text-textPrimary mb-1">{title}</h3>
              <p className="text-sm text-textMuted" dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
          ))}
        </div>
      </section>

      {/* League Table */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-textPrimary">VIP Leaderboard</h2>
          <span className="text-sm text-textMuted">{entries.length} members</span>
        </div>

        {entries.length === 0 && (!user || isMember) ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-textMuted">
              The VIP League is being set up. Check back soon!
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-xs font-medium text-textMuted uppercase tracking-wide">
              <div className="col-span-1">Pos</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-4 text-right">Points</div>
            </div>

            {/* Rows */}
            {entries.map((entry, i) => {
              const medal = MEDALS[i];
              const isTop3 = i < 3;
              const isCurrentUser = entry.is_current_user;

              return (
                <div
                  key={entry.user_id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0 ${
                    isTop3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''
                  } ${isCurrentUser ? 'bg-amber-500/10 ring-1 ring-amber-500/30 rounded' : ''}`}
                >
                  {/* Position */}
                  <div className="col-span-1">
                    <span className={`text-lg ${isTop3 ? '' : 'text-textMuted'}`}>
                      {isTop3 ? medal : i + 1}
                    </span>
                  </div>

                  {/* Player */}
                  <div className="col-span-7 flex items-center gap-3">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt={entry.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surfaceLight flex items-center justify-center text-xs font-bold text-textMuted">
                        {entry.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className={`font-medium ${isCurrentUser ? 'text-amber-400 font-bold' : isTop3 ? 'text-textPrimary' : 'text-textSecondary'}`}>
                      {entry.username}
                      {isCurrentUser && <span className="ml-2 text-xs text-amber-400">(you)</span>}
                    </span>
                  </div>

                  {/* Points */}
                  <div className={`col-span-4 text-right font-bold ${isTop3 ? 'text-amber-400' : 'text-textPrimary'}`}>
                    {entry.total_points}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-textMuted">
          Points update after each match week.
        </div>
      </section>

      <Footer />
    </div>
  );
}