'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function LeagueLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  const [league, setLeague] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadLeagueLeaderboard();
  }, [leagueId]);

  async function loadLeagueLeaderboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    setCurrentUserId(user.id);

    // Fetch league info
    const { data: leagueData } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (!leagueData) {
      router.push('/leagues');
      return;
    }
    setLeague(leagueData);

    // Check membership
    const { data: membership } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      router.push('/leagues');
      return;
    }

    // Fetch all members
    const { data: memberList } = await supabase
      .from('league_members')
      .select('user_id')
      .eq('league_id', leagueId);

    if (!memberList) { setLoading(false); return; }

    // Get scores for each member
    const enriched = await Promise.all((memberList || []).map(async (m: any) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', m.user_id)
        .single();

      const { data: scored } = await supabase
        .from('predictions')
        .select('points_awarded, is_exact_score, is_correct_result')
        .eq('user_id', m.user_id)
        .not('scored_at', 'is', null);

      const totalPoints = (scored || []).reduce((sum: number, p: any) => sum + (p.points_awarded || 0), 0);
      const exactScores = (scored || []).filter((p: any) => p.is_exact_score).length;
      const correctResults = (scored || []).filter((p: any) => p.is_correct_result && !p.is_exact_score).length;
      const totalPreds = (scored || []).length;

      return {
        user_id: m.user_id,
        username: profile?.username || 'Unknown',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-textMuted">Loading leaderboard...</div>
      </div>
    );
  }

  const myIndex = members.findIndex(m => m.user_id === currentUserId);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/leagues" className="text-textMuted hover:text-text transition-colors">← Leagues</Link>
          <span className="text-textMuted">/</span>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🏆</span> {league?.name}
          </h1>
          {league?.is_public && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Public</span>
          )}
        </div>

        {/* My Rank Summary */}
        {myIndex >= 0 && (
          <div className="card mb-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textMuted text-sm">Your Position</p>
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
        <div className="card overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-textMuted">No predictions yet</p>
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
                        <span className={`font-medium ${member.user_id === currentUserId ? 'text-primary' : ''}`}>
                          {member.username}
                        </span>
                        {member.user_id === currentUserId && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">You</span>
                        )}
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
              }}
              className="btn-secondary text-sm"
            >
              📋 Copy Invite Link
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
