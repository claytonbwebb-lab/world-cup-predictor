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
    const { match_id, home_score, away_score } = await request.json();

    if (!match_id || home_score === undefined || away_score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: predictions, error: fetchError } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', match_id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const updates = (predictions || []).map((prediction) => {
      const isExactScore =
        prediction.home_prediction === home_score &&
        prediction.away_prediction === away_score;

      let actualResult: 'home' | 'draw' | 'away';
      if (home_score > away_score) actualResult = 'home';
      else if (home_score === away_score) actualResult = 'draw';
      else actualResult = 'away';

      let predictedResult: 'home' | 'draw' | 'away';
      if (prediction.home_prediction > prediction.away_prediction) predictedResult = 'home';
      else if (prediction.home_prediction === prediction.away_prediction) predictedResult = 'draw';
      else predictedResult = 'away';

      const isCorrectResult = actualResult === predictedResult && !isExactScore;

      let points = 0;
      if (isExactScore) points = 3;
      else if (isCorrectResult) points = 1;

      return {
        id: prediction.id,
        points_awarded: points,
        is_exact_score: isExactScore,
        is_correct_result: isCorrectResult || isExactScore,
        scored_at: new Date().toISOString(),
      };
    });

    for (const update of updates) {
      await supabase.from('predictions').update({
        points_awarded: update.points_awarded,
        is_exact_score: update.is_exact_score,
        is_correct_result: update.is_correct_result,
        scored_at: update.scored_at,
      }).eq('id', update.id);
    }

    await supabase.from('matches').update({
      home_score,
      away_score,
      result_entered: true,
      updated_at: new Date().toISOString(),
    }).eq('id', match_id);

    return NextResponse.json({
      success: true,
      scored: updates.length,
      pointsAwarded: updates.reduce((sum, u) => sum + u.points_awarded, 0),
    });
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
