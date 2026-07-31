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

    // kickoff_at arrives as UTC ISO string (converted in browser before sending)
    const { data, error } = await supabase
      .from('matches')
      .insert({
        home_team,
        away_team,
        home_flag: home_flag || null,
        away_flag: away_flag || null,
        group_stage: group_stage || null,
        kickoff_at,
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