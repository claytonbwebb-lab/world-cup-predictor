import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import TeamBadge from '@/components/TeamBadge';

const NotificationBanner = dynamic(() => import('@/components/NotificationBanner'), { ssr: false });

// Official short names for World Cup branding
const TEAM_SHORT: Record<string, string> = {
  'South Korea': 'Korea Republic',
  'Czech Republic': 'Czech Rep.',
  'Bosnia & Herzegovina': 'Bosnia/Herzeg.',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Ivory Coast': 'Ivory Coast',
  'Curaçao': 'Curaçao',
  'IR Iran': 'IR Iran',
  'United States': 'USA',
  'USA': 'USA',
  'Canada': 'Canada',
  'Mexico': 'Mexico',
  'Brazil': 'Brazil',
  'Germany': 'Germany',
  'England': 'England',
  'France': 'France',
  'Spain': 'Spain',
  'Netherlands': 'Netherlands',
  'Belgium': 'Belgium',
  'Portugal': 'Portugal',
  'Argentina': 'Argentina',
  'Uruguay': 'Uruguay',
  'Japan': 'Japan',
  'Australia': 'Australia',
  'Morocco': 'Morocco',
  'Switzerland': 'Switzerland',
  'Scotland': 'Scotland',
  'Turkey': 'Turkey',
  'Poland': 'Poland',
  'Saudi Arabia': 'Saudi Arabia',
  'Egypt': 'Egypt',
  'Senegal': 'Senegal',
  'Ghana': 'Ghana',
  'Cameroon': 'Cameroon',
  'Nigeria': 'Nigeria',
  'Algeria': 'Algeria',
  'Tunisia': 'Tunisia',
  'Ecuador': 'Ecuador',
  'Peru': 'Peru',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Paraguay': 'Paraguay',
  'Qatar': 'Qatar',
  'New Zealand': 'New Zealand',
  'Costa Rica': 'Costa Rica',
  'Panama': 'Panama',
  'Haiti': 'Haiti',
  'Jamaica': 'Jamaica',
  'Serbia': 'Serbia',
  'Croatia': 'Croatia',
  'Denmark': 'Denmark',
  'Sweden': 'Sweden',
  'Norway': 'Norway',
  'Austria': 'Austria',
  'Ukraine': 'Ukraine',
  'Romania': 'Romania',
  'Hungary': 'Hungary',
  'Slovakia': 'Slovakia',
  'Slovenia': 'Slovenia',
  'Ireland': 'Ireland',
  'Wales': 'Wales',
  'Italy': 'Italy',
};

function getTeamName(name: string, useShort = false): string {
  return useShort && TEAM_SHORT[name] ? TEAM_SHORT[name] : name;
}

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

  // Fetch user rank from leaderboard
  const { data: leaderboardData } = await supabase
    .from('leaderboard')
    .select('user_id')
    .order('total_points', { ascending: false })
    .order('exact_scores', { ascending: false });
  const userRank = leaderboardData
    ? leaderboardData.findIndex((e: any) => e.user_id === user.id) + 1
    : 0;

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
        <NotificationBanner />

        {/* Welcome Section */}
        <div className="mb-8 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile?.avatar_url || '/default-avatar.png'}
            alt={profile?.username || 'Player'}
            className="w-16 h-16 rounded-full object-cover border-2 border-border"
          />
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {profile?.username || 'Player'}! 👋
            </h1>
            <p className="text-textMuted">
              Ready to predict some matches?
            </p>
          </div>
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
            <p className="text-3xl font-bold">{userRank > 0 ? userRank : '-'}</p>
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
                    className="flex items-center gap-2 p-3 bg-surfaceLight rounded-lg"
                  >
                    {/* Home team: flag centred above name */}
                    <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                      <TeamBadge value={match.home_flag} size="md" />
                      <span className="text-xs font-medium text-center leading-tight break-words w-full">{getTeamName(match.home_team, true)}</span>
                    </div>
                    <span className="text-textMuted text-xs shrink-0">vs</span>
                    {/* Away team: flag centred above name */}
                    <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                      <TeamBadge value={match.away_flag} size="md" />
                      <span className="text-xs font-medium text-center leading-tight break-words w-full">{getTeamName(match.away_team, true)}</span>
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
              <>
                {/* Mobile: flag-above-name, scores centred (default — shown below 768px) */}
                <div className="md:hidden space-y-2">
                  {recentPredictions.map((pred: any) => (
                    <div
                      key={pred.id}
                      className="flex items-center gap-2 px-2 py-2.5 bg-surfaceLight rounded-lg"
                    >
                      {/* Home: flag above name */}
                      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <TeamBadge value={pred.match.home_flag} size="sm" />
                        <span className="text-[11px] font-medium text-center leading-tight break-words w-full">{getTeamName(pred.match.home_team, true)}</span>
                      </div>
                      {/* Scores centred */}
                      <div className="shrink-0 flex flex-col items-center gap-0.5">
                        <div className="flex gap-2 text-[9px] text-textMuted">
                          <span>pred</span><span>act</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="font-medium">{pred.home_prediction}-{pred.away_prediction}</span>
                          <span className="font-bold text-primary">{pred.match.home_score}-{pred.match.away_score}</span>
                        </div>
                      </div>
                      {/* Away: flag above name */}
                      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <TeamBadge value={pred.match.away_flag} size="sm" />
                        <span className="text-[11px] font-medium text-center leading-tight break-words w-full">{getTeamName(pred.match.away_team, true)}</span>
                      </div>
                      {/* Points */}
                      <div className="shrink-0 flex flex-col items-end gap-0.5">
                        {pred.is_exact_score && (
                          <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded">EXACT</span>
                        )}
                        <span className="text-xs font-bold text-primary">+{pred.points_awarded}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: 5-col table (shown at 768px+) */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-[1fr_5rem_5rem_1fr_auto] items-center gap-2 px-3 pb-1 text-xs text-textMuted uppercase tracking-wider">
                    <div className="text-right pr-2">Home Team</div>
                    <div className="text-center">Predicted</div>
                    <div className="text-center">Actual</div>
                    <div className="text-left pl-2">Away Team</div>
                    <div className="text-right pl-2">Pts</div>
                  </div>
                  <div className="space-y-2">
                    {recentPredictions.map((pred: any) => (
                      <div
                        key={pred.id}
                        className="grid grid-cols-[1fr_5rem_5rem_1fr_auto] items-center gap-2 p-3 bg-surfaceLight rounded-lg"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium leading-tight">{getTeamName(pred.match.home_team, true)}</div>
                          </div>
                          <TeamBadge value={pred.match.home_flag} size="sm" />
                        </div>
                        <div className="w-[5rem] text-center">
                          <div className="text-xs text-textMuted/60 mb-0.5">Predicted</div>
                          <div className="text-sm font-medium">
                            {pred.home_prediction} - {pred.away_prediction}
                          </div>
                        </div>
                        <div className="w-[5rem] text-center">
                          <div className="text-xs text-textMuted/60 mb-0.5">Actual</div>
                          <div className="text-sm font-bold text-primary">
                            {pred.match.home_score} - {pred.match.away_score}
                          </div>
                        </div>
                        <div className="flex items-center justify-start gap-2">
                          <TeamBadge value={pred.match.away_flag} size="sm" />
                          <div className="text-left">
                            <div className="text-sm font-medium leading-tight">{getTeamName(pred.match.away_team, true)}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {pred.is_exact_score && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">EXACT</span>
                          )}
                          <span className="font-bold text-primary">+{pred.points_awarded}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-textMuted text-center py-8">
                No predictions scored yet. Go make some predictions!
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}