import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const formData = await request.formData();

    const home_team = formData.get('home_team') as string;
    const away_team = formData.get('away_team') as string;
    const home_flag = formData.get('home_flag') as string;
    const away_flag = formData.get('away_flag') as string;
    const group_stage = formData.get('group_stage') as string;
    const kickoff_at = formData.get('kickoff_at') as string;

    if (!home_team || !away_team || !kickoff_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse YYYY-MM-DDTHH:mm as local time without going through Date's ISO parser
    // This avoids the datetime-local string being misinterpreted as UTC
    kickoff_at: new Date(kickoff_at).toISOString(),

    const { data, error } = await supabase
      .from('matches')
      .insert({
        home_team,
        away_team,
        home_flag: home_flag || null,
        away_flag: away_flag || null,
        group_stage: group_stage || null,
        kickoff_at: kickoffUtc,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Add match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}