import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // Sum points for predictions where the match result has been entered
  // points_awarded is pre-computed: 3 = exact score, 1 = correct result, 0 = wrong
  const { data: predictions, error } = await service
    .from('predictions')
    .select('user_id, points_awarded, matches(result_entered)')
    .eq('matches.result_entered', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Sum points per user
  const userPoints: Record<string, number> = {};
  for (const pred of predictions || []) {
    userPoints[pred.user_id] = (userPoints[pred.user_id] || 0) + (pred.points_awarded || 0);
  }

  // Get all users with their favourite teams
  const { data: profiles } = await service
    .from('profiles')
    .select('id, favourite_team')
    .not('favourite_team', 'is', null);

  // Aggregate by team
  const teamStats: Record<string, { total: number; count: number }> = {};
  for (const profile of profiles || []) {
    const pts = userPoints[profile.id] || 0;
    if (!teamStats[profile.favourite_team]) {
      teamStats[profile.favourite_team] = { total: 0, count: 0 };
    }
    teamStats[profile.favourite_team].total += pts;
    teamStats[profile.favourite_team].count += 1;
  }

  const ranked = Object.entries(teamStats)
    .map(([team, stats]) => ({
      team,
      total_points: stats.total,
      num_supporters: stats.count,
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 30);

  return NextResponse.json({ clubs: ranked });
}