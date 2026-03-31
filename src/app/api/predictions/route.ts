import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const match_id = body.match_id as string;
    const home_prediction = parseInt(body.home_prediction);
    const away_prediction = parseInt(body.away_prediction);

    if (!match_id || isNaN(home_prediction) || isNaN(away_prediction)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Check if match is locked
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const kickoff = new Date(match.kickoff_at);
    if (match.is_locked || kickoff < new Date()) {
      return NextResponse.json({ error: 'Match is locked' }, { status: 403 });
    }

    // Upsert prediction
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        {
          user_id: user.id,
          match_id,
          home_prediction,
          away_prediction,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,match_id',
        }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}