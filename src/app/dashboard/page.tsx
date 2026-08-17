import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import TeamBadge from '@/components/TeamBadge';
import SupporterLeagueBanner from '@/components/SupporterLeagueBanner';
import { getWeekNumber } from '@/lib/weeks';

interface DoubleUpPick {
  match?: {
    id: string;
    home_team: string;
    away_team: string;
    home_flag: string;
    away_flag: string;
    kickoff_at: string;
  };
}

const NotificationBanner = dynamic(() => import('@/components/NotificationBanner'), { ssr: false });

// Official short names for Premier League branding
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
    .eq('is_visible', true)
    .order('kickoff_at', { ascending: true })
    .limit(5);

  // Fetch user's current double-up pick for this week (use service role to bypass RLS)
  const currentWeek = getWeekNumber(new Date());
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: doubleUpPick } = await serviceClient
    .from('double_up_picks')
    .select('match:matches(*)')
    .eq('user_id', user.id)
    .eq('week_number', currentWeek)
    .single();

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

  // Fetch user's double-up picks for the scored matches so we can show the badge
  const scoredMatchIds = (recentPredictions || []).map((p: any) => p.match_id);
  let doubleUpMatchIds = new Set<string>();
  if (scoredMatchIds.length > 0) {
    const { data: duPicks } = await serviceClient
      .from('double_up_picks')
      .select('match_id')
      .eq('user_id', user.id)
      .in('match_id', scoredMatchIds);
    doubleUpMatchIds = new Set((duPicks || []).map((p: any) => p.match_id));
  }

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
    .order('exact_scores', { ascending: false })
    .order('correct_results', { ascending: false })
    .order('user_id', { ascending: true });
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <p className="text-3xl font-bold text-warning">{stats?.exact_scores || 0}</p>
          </div>
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Correct Results</p>
            <p className="text-3xl font-bold text-green-400">{stats?.correct_results || 0}</p>
          </div>
          <div className="card">
            <p className="text-textMuted text-sm mb-1">Rank</p>
            <p className="text-3xl font-bold">{userRank > 0 ? userRank : '-'}</p>
          </div>
        </div>

        {/* Current Double Up pick */}
        {(() => {
          const pick = doubleUpPick as unknown as DoubleUpPick;
          if (!pick?.match) return null;
          return (
            <div className="card mb-8 border-yellow-400/30 bg-yellow-400/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Your Double Up pick this week</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TeamBadge value={pick.match.home_flag} size="sm" />
                    <span className="text-sm font-medium">{pick.match.home_team}</span>
                    <span className="text-xs text-textMuted">vs</span>
                    <TeamBadge value={pick.match.away_flag} size="sm" />
                    <span className="text-sm font-medium">{pick.match.away_team}</span>
                  </div>
                </div>
                <Link href="/fixtures" className="ml-auto text-sm text-primary hover:underline shrink-0">
                  Change →
                </Link>
              </div>
            </div>
          );
        })()}

        {/* Supporter League prompt — only when no favourite team set */}
        {!profile?.favourite_team && (
          <SupporterLeagueBanner hasFavouriteTeam={false} />
        )}

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
                      className="flex items-center gap-2 px-2 py-2.5 bg-surfaceLight rounded-lg relative"
                    >
                      {/* Badges — absolute top-right so they never push layout */}
                      <div className="absolute top-1 right-1.5 flex flex-col items-end gap-0.5">
                        {pred.is_exact_score && (
                          <span className="text-[8px] bg-primary/20 text-primary px-1 py-0.5 rounded whitespace-nowrap">EXACT</span>
                        )}
                        {doubleUpMatchIds.has(pred.match_id) && (
                          <span className="text-[8px] bg-yellow-400/20 text-yellow-400 px-1 py-0.5 rounded whitespace-nowrap">2×</span>
                        )}
                      </div>

                      {/* Home: flag above name — match fixtures (md badge, text-xs) */}
                      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <TeamBadge value={pred.match.home_flag} size="md" />
                        <span className="text-xs font-medium text-center leading-tight break-words w-full">{getTeamName(pred.match.home_team, true)}</span>
                      </div>
                      {/* Scores — stacked vertically to free horizontal space for bigger teams */}
                      <div className="shrink-0 flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-textMuted">{pred.home_prediction}-{pred.away_prediction}</span>
                        <span className="text-xs font-bold text-primary">{pred.match.home_score}-{pred.match.away_score}</span>
                      </div>
                      {/* Away: flag above name — match fixtures */}
                      <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                        <TeamBadge value={pred.match.away_flag} size="md" />
                        <span className="text-xs font-medium text-center leading-tight break-words w-full">{getTeamName(pred.match.away_team, true)}</span>
                      </div>
                      {/* Points — fixed width, always aligned */}
                      <div className="w-7 text-right shrink-0">
                        <span className="text-xs font-bold text-primary whitespace-nowrap">+{pred.points_awarded}</span>
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
                    {recentPredictions.map((pred: any) => {
                      const matchDate = pred.match.kickoff_at
                        ? new Date(pred.match.kickoff_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : null;
                      return (
                      <div
                        key={pred.id}
                        className="grid grid-cols-[1fr_5rem_5rem_1fr_minmax(6rem,auto)] items-center gap-2 p-3 bg-surfaceLight rounded-lg"
                      >
                        {/* Home team — badge over name, like fixtures */}
                        <div className="flex flex-col items-center gap-1">
                          <TeamBadge value={pred.match.home_flag} size="md" />
                          <span className="text-xs font-medium text-center leading-tight">{getTeamName(pred.match.home_team, true)}</span>
                          {matchDate && <span className="text-[9px] text-textMuted">{matchDate}</span>}
                        </div>

                        <div className="w-[5rem] text-center">
                          <div className="text-[10px] text-textMuted/60 mb-0.5">Predicted</div>
                          <div className="text-sm font-medium">
                            {pred.home_prediction} - {pred.away_prediction}
                          </div>
                        </div>
                        <div className="w-[5rem] text-center">
                          <div className="text-[10px] text-textMuted/60 mb-0.5">Actual</div>
                          <div className="text-sm font-bold text-primary">
                            {pred.match.home_score} - {pred.match.away_score}
                          </div>
                        </div>

                        {/* Away team — badge over name, like fixtures */}
                        <div className="flex flex-col items-center gap-1">
                          <TeamBadge value={pred.match.away_flag} size="md" />
                          <span className="text-xs font-medium text-center leading-tight">{getTeamName(pred.match.away_team, true)}</span>
                        </div>

                        {/* Tags + Points — stacked vertically, anchored right */}
                        <div className="flex flex-col items-end gap-0.5">
                          {pred.is_exact_score && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded whitespace-nowrap">EXACT</span>
                          )}
                          {doubleUpMatchIds.has(pred.match_id) && (
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded whitespace-nowrap">DOUBLE UP</span>
                          )}
                          <span className="font-bold text-primary whitespace-nowrap">+{pred.points_awarded}</span>
                        </div>
                      </div>
                      );
                    })}
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