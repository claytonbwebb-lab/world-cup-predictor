import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const vipLeagueId = process.env.VIP_LEAGUE_ID;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceKeyPrefix = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').substring(0, 10);

  const { data: members, error } = await supabase
    .from('league_members')
    .select('user_id')
    .eq('league_id', vipLeagueId || 'MISSING');

  return NextResponse.json({
    vipLeagueId,
    hasServiceKey,
    serviceKeyPrefix,
    membersCount: members?.length || 0,
    members: members || [],
    error: error?.message || null,
  });
}