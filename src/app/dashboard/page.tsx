import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch upcoming matches that need predictions
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*')
    .gt('kickoff_at', new Date().toISOString())
    .eq('is_locked', false)
    .order('kickoff_at', { ascending: true })
    .limit(5);

  // Fetch user's recent predictions with results
  const { data: recentPredictions } = await supabase
    .from('predictions')
    .select(`
      *,
      match:matches(*)
    `)
    .eq('user_id', user.id)
    .not('scored_at', 'is', null)
    .order('scored_at', { ascending: false })
    .limit(5);

  // Fetch user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.username || 'Player'}! 👋
          </h1>
          <p className="text-textMuted">
            Ready to predict some matches?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Total Points</p>
            <p className="text-3xl font-bold text-primary">{stats?.total_points || 0}</p>
          </div>
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Predictions Made</p>
            <p className="text-3xl font-bold">{stats?.matches_predicted || 0}</p>
          </div>
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Exact Scores</p>
            <p className="text-3xl font-bold text-warning">
              {stats?.scored_predictions || 0}
            </p>
          </div>
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Rank</p>
            <p className="text-3xl font-bold">-</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Fixtures */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upcoming Fixtures</h2>
              <Link href="/fixtures" className="text-primary text-sm hover:underline">
                View All →
              </Link>
            </div>
            
            {upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{match.home_flag || '🏳️'}</span>
                      <span className="font-medium truncate">{match.home_team}</span>
                    </div>
                    <span className="text-textMuted text-sm shrink-0 px-2">vs</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{match.away_team}</span>
                      <span className="text-xl shrink-0">{match.away_flag || '🏳️'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted text-center py-8">
                No upcoming matches to predict
              </p>
            )}
          </div>

          {/* Recent Results */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Recent Results</h2>
              <Link href="/fixtures" className="text-primary text-sm hover:underline">
                Predict More →
              </Link>
            </div>
            
            {recentPredictions && recentPredictions.length > 0 ? (
              <div className="space-y-3">
                {recentPredictions.map((pred: any) => (
                  <div
                    key={pred.id}
                    className="flex items-center justify-between p-3 bg-surfaceLight rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{pred.match.home_flag || '🏳️'}</span>
                      <span className="font-medium">{pred.match.home_team}</span>
                      <span className="text-textMuted">
                        {pred.match.home_score} - {pred.match.away_score}
                      </span>
                      <span className="font-medium">{pred.match.away_team}</span>
                      <span className="text-xl">{pred.match.away_flag || '🏳️'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        +{pred.points_awarded}
                      </span>
                      {pred.is_exact_score && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          EXACT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted text-center py-8">
                No predictions scored yet. Go make some predictions!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}