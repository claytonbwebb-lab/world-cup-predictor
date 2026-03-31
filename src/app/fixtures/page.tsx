import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function FixturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all matches with user's predictions
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      prediction:predictions!inner(*)
    `)
    .order('kickoff_at', { ascending: true });

  // Also fetch user's predictions separately for easier access
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);

  const predictionMap = new Map(
    predictions?.map(p => [p.match_id, p]) || []
  );

  // Group matches by status
  const now = new Date();
  const liveMatches = [];
  const upcomingMatches = [];
  const completedMatches = [];

  for (const match of matches || []) {
    const kickoff = new Date(match.kickoff_at);
    const isLocked = match.is_locked || kickoff < now;

    const matchWithPrediction = {
      ...match,
      prediction: predictionMap.get(match.id),
      isLocked,
    };

    if (match.result_entered) {
      completedMatches.push(matchWithPrediction);
    } else if (isLocked) {
      liveMatches.push(matchWithPrediction);
    } else {
      upcomingMatches.push(matchWithPrediction);
    }
  }

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
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span>🏆</span>
            <span>World Cup Predictor</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-textMuted hover:text-text">Dashboard</Link>
            <Link href="/fixtures" className="text-primary font-medium">Fixtures</Link>
            <Link href="/leaderboard" className="text-textMuted hover:text-text">Leaderboard</Link>
            <Link href="/leagues" className="text-textMuted hover:text-text">Leagues</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Match Fixtures & Predictions</h1>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📅</span> Upcoming Matches
            </h2>
            <div className="space-y-4">
              {upcomingMatches.map((match: any) => (
                <PredictionCard key={match.id} match={match} userId={user.id} />
              ))}
            </div>
          </section>
        )}

        {/* Live/In Progress Matches */}
        {liveMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🔒</span> Locked (In Progress)
            </h2>
            <div className="space-y-4">
              {liveMatches.map((match: any) => (
                <PredictionCard key={match.id} match={match} userId={user.id} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>✅</span> Completed
            </h2>
            <div className="space-y-4">
              {completedMatches.map((match: any) => (
                <CompletedMatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {matches?.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-textMuted">No matches scheduled yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

function PredictionCard({ match, userId }: { match: any; userId: string }) {
  const isLocked = match.isLocked;
  const hasPrediction = !!match.prediction;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-textMuted">
          {match.group_stage && <span className="mr-2">{match.group_stage}</span>}
          {new Date(match.kickoff_at).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        {isLocked && (
          <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
            Locked
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{match.home_flag || '🏳️'}</span>
          <span className="font-semibold text-lg">{match.home_team}</span>
        </div>
        <span className="text-textMuted">vs</span>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">{match.away_team}</span>
          <span className="text-3xl">{match.away_flag || '🏳️'}</span>
        </div>
      </div>

      {isLocked ? (
        <div className="text-center py-4 bg-surfaceLight rounded-lg">
          {hasPrediction ? (
            <div className="flex items-center justify-center gap-4">
              <span className="text-textMuted">Your prediction:</span>
              <span className="text-xl font-bold">
                {match.prediction.home_prediction} - {match.prediction.away_prediction}
              </span>
            </div>
          ) : (
            <span className="text-textMuted">No prediction made</span>
          )}
        </div>
      ) : (
        <PredictionForm match={match} userId={userId} existingPrediction={match.prediction} />
      )}
    </div>
  );
}

function PredictionForm({ match, userId, existingPrediction }: { match: any; userId: string; existingPrediction?: any }) {
  return (
    <form
      action="/api/predictions"
      method="POST"
      className="flex items-center justify-center gap-4"
    >
      <input type="hidden" name="match_id" value={match.id} />
      <input type="hidden" name="user_id" value={userId} />
      
      <div className="flex items-center gap-2">
        <input
          type="number"
          name="home_prediction"
          defaultValue={existingPrediction?.home_prediction ?? ''}
          min="0"
          max="20"
          required
          disabled={match.isLocked}
          className="input w-16 text-center"
          placeholder="-"
        />
        <span className="text-textMuted">-</span>
        <input
          type="number"
          name="away_prediction"
          defaultValue={existingPrediction?.away_prediction ?? ''}
          min="0"
          max="20"
          required
          disabled={match.isLocked}
          className="input w-16 text-center"
          placeholder="-"
        />
      </div>

      {!match.isLocked && (
        <button type="submit" className="btn-primary">
          {existingPrediction ? 'Update' : 'Predict'}
        </button>
      )}
    </form>
  );
}

function CompletedMatchCard({ match }: { match: any }) {
  const prediction = match.prediction;

  return (
    <div className="card opacity-75">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-textMuted">
          {match.group_stage && <span className="mr-2">{match.group_stage}</span>}
        </div>
        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
          Final
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{match.home_flag || '🏳️'}</span>
          <span className="font-semibold">{match.home_team}</span>
        </div>
        <span className="mx-4 text-2xl font-bold text-primary">
          {match.home_score} - {match.away_score}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{match.away_team}</span>
          <span className="text-2xl">{match.away_flag || '🏳️'}</span>
        </div>
      </div>

      {prediction ? (
        <div className="text-center py-2 bg-surfaceLight rounded-lg">
          <span className="text-textMuted">You predicted: </span>
          <span className="font-bold">{prediction.home_prediction} - {prediction.away_prediction}</span>
          {prediction.points_awarded > 0 && (
            <span className="ml-2 text-primary font-bold">+{prediction.points_awarded} pts</span>
          )}
        </div>
      ) : (
        <div className="text-center py-2 bg-surfaceLight rounded-lg text-textMuted">
          No prediction made
        </div>
      )}
    </div>
  );
}