import { createClient } from '@/lib/supabase/server';
import { findTeam } from '@/lib/teams';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export const runtime = 'edge';

interface ClubStanding {
  team: string;
  total_points: number;
  num_supporters: number;
  avg_points: number;
}

async function getSupporterLeague(): Promise<ClubStanding[]> {
  const supabase = createClient();
  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: predictions, error } = await service
    .from('predictions')
    .select('user_id, points_awarded, matches(result_entered)')
    .eq('matches.result_entered', true);

  if (error || !predictions) return [];

  const userPoints: Record<string, number> = {};
  for (const pred of predictions) {
    userPoints[pred.user_id] = (userPoints[pred.user_id] || 0) + (pred.points_awarded || 0);
  }

  const { data: profiles } = await service
    .from('profiles')
    .select('id, favourite_team')
    .not('favourite_team', 'is', null);

  const teamStats: Record<string, { total: number; count: number }> = {};
  for (const profile of profiles || []) {
    const pts = userPoints[profile.id] || 0;
    if (!teamStats[profile.favourite_team]) {
      teamStats[profile.favourite_team] = { total: 0, count: 0 };
    }
    teamStats[profile.favourite_team].total += pts;
    teamStats[profile.favourite_team].count += 1;
  }

  return Object.entries(teamStats)
    .map(([team, stats]) => ({
      team,
      total_points: stats.total,
      num_supporters: stats.count,
      avg_points: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 20);
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default async function SupporterLeaguePage() {
  const clubs = await getSupporterLeague();

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-bg to-secondary/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <span>🏆</span> New Feature
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4">
            The Supporter League
          </h1>
          <p className="text-lg text-textMuted max-w-2xl mx-auto mb-6">
            Every point you earn as a predictor also counts for your club. Add up all the points from
            fans of each club and you&apos;ve got the Supporter League. See which club&apos;s fans are
            the best predictors.
          </p>
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2">
            Join the competition → <span className="text-sm opacity-70">It&apos;s free</span>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-textPrimary mb-6 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Pick your club', desc: 'Select your favourite club when you sign up, or anytime from your account settings.' },
            { step: '2', title: 'Make predictions', desc: 'Predict match scores for Premier League games. Each correct result earns you points.' },
            { step: '3', title: 'Your club scores', desc: 'Your points add to your club\'s total. The club with the most points from their fans tops the league.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-surface border border-border rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm mb-3">{step}</div>
              <h3 className="font-semibold text-textPrimary mb-1">{title}</h3>
              <p className="text-sm text-textMuted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* League Table */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-textPrimary">Club Standings</h2>
          <span className="text-sm text-textMuted">Top 20 clubs</span>
        </div>

        {clubs.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">⚽</div>
            <p className="text-textMuted">
              No clubs have supporters yet. <Link href="/signup" className="text-primary">Sign up</Link> and pick your club to be the first!
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border text-xs font-medium text-textMuted uppercase tracking-wide">
              <div className="col-span-1">Pos</div>
              <div className="col-span-5">Club</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Fans</div>
              <div className="col-span-2 text-right">Avg</div>
            </div>

            {/* Rows */}
            {clubs.map((club, i) => {
              const teamInfo = findTeam(club.team);
              const medal = MEDALS[i];
              const isTop3 = i < 3;

              return (
                <div
                  key={club.team}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0 ${
                    isTop3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                  }`}
                >
                  {/* Position */}
                  <div className="col-span-1">
                    <span className={`text-lg ${isTop3 ? '' : 'text-textMuted'}`}>
                      {isTop3 ? medal : i + 1}
                    </span>
                  </div>

                  {/* Club */}
                  <div className="col-span-5 flex items-center gap-3">
                    {teamInfo ? (
                      <img src={teamInfo.badge} alt={club.team} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surfaceLight flex items-center justify-center text-xs">⚽</div>
                    )}
                    <span className={`font-medium ${isTop3 ? 'text-textPrimary' : 'text-textSecondary'}`}>
                      {club.team}
                    </span>
                  </div>

                  {/* Total Points */}
                  <div className={`col-span-2 text-right font-bold ${isTop3 ? 'text-primary' : 'text-textPrimary'}`}>
                    {club.total_points}
                  </div>

                  {/* Num supporters */}
                  <div className="col-span-2 text-right text-textMuted text-sm">
                    {club.num_supporters}
                  </div>

                  {/* Avg points */}
                  <div className="col-span-2 text-right text-textMuted text-sm">
                    {club.avg_points}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-textMuted">
          Points update after each match week.{' '}
          <Link href="/signup" className="text-primary">Sign up</Link> to join the Supporter League.
        </div>
      </section>

      <Footer />
    </div>
  );
}