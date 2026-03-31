import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch leaderboard data
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(50);

  // Get current user's rank
  const userRank = leaderboard?.findIndex((entry) => entry.user_id === user.id);
  const userEntry = userRank !== undefined && userRank >= 0 ? leaderboard?.[userRank] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span>🥇</span> Global Leaderboard
        </h1>

        {/* User's Rank Summary */}
        {userEntry && (
          <div className="card mb-8 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textMuted text-sm">Your Position</p>
                <p className="text-3xl font-bold">
                  {userRank !== undefined ? userRank + 1 : '-'}
                  <span className="text-textMuted text-lg font-normal"> / {leaderboard?.length || 0}</span>
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
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-textMuted font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-textMuted font-medium">Player</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Points</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Exact</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Results</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Predictions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry, index) => (
                <tr
                  key={entry.user_id}
                  className={`border-b border-border/50 hover:bg-surfaceLight/50 transition-colors ${
                    entry.user_id === user.id ? 'bg-primary/10' : ''
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
                      <span className={`font-medium ${entry.user_id === user.id ? 'text-primary' : ''}`}>
                        {entry.username}
                      </span>
                      {entry.user_id === user.id && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
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
              ))}
            </tbody>
          </table>

          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-textMuted">No predictions yet</p>
              <p className="text-textMuted text-sm">Be the first to make a prediction!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}