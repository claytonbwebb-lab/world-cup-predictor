import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminSecret = cookieStore.get('admin_secret')?.value;

  if (adminSecret !== '1') {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  // Fetch all matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <span>🏆</span>
              <span>Play Predict Win</span>
            </Link>
            <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-sm font-medium">
              Admin Panel
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-textMuted hover:text-text">Dashboard</Link>
            <Link href="/fixtures" className="text-textMuted hover:text-text">Fixtures</Link>
            <Link href="/leaderboard" className="text-textMuted hover:text-text">Leaderboard</Link>
            <Link href="/" className="text-textMuted hover:text-text">Back to Home</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span>⚙️</span> Admin Panel
        </h1>

        {/* Add Match Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Match</h2>
          <form action="/api/admin/matches" method="POST" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Home Team</label>
                <input
                  type="text"
                  name="home_team"
                  required
                  className="input w-full"
                  placeholder="Argentina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Team</label>
                <input
                  type="text"
                  name="away_team"
                  required
                  className="input w-full"
                  placeholder="Brazil"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Home Flag (emoji)</label>
                <input
                  type="text"
                  name="home_flag"
                  className="input w-full"
                  placeholder="🇦🇷"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Flag (emoji)</label>
                <input
                  type="text"
                  name="away_flag"
                  className="input w-full"
                  placeholder="🇧🇷"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group/Stage</label>
                <input
                  type="text"
                  name="group_stage"
                  className="input w-full"
                  placeholder="Group A, Quarter-final, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kickoff</label>
                <input
                  type="datetime-local"
                  name="kickoff_at"
                  required
                  className="input w-full"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Add Match
            </button>
          </form>
        </div>

        {/* Matches Management */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Manage Matches</h2>
          
          {matches && matches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-textMuted font-medium">Match</th>
                    <th className="text-left py-3 px-4 text-textMuted font-medium">Stage</th>
                    <th className="text-left py-3 px-4 text-textMuted font-medium">Kickoff</th>
                    <th className="text-left py-3 px-4 text-textMuted font-medium">Result</th>
                    <th className="text-center py-3 px-4 text-textMuted font-medium">Status</th>
                    <th className="text-center py-3 px-4 text-textMuted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{match.home_flag || '🏳️'}</span>
                          <span className="font-medium">{match.home_team}</span>
                          <span className="text-textMuted">vs</span>
                          <span className="font-medium">{match.away_team}</span>
                          <span>{match.away_flag || '🏳️'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-textMuted">
                        {match.group_stage || '-'}
                      </td>
                      <td className="py-3 px-4 text-textMuted">
                        {new Date(match.kickoff_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {match.result_entered ? (
                          <span className="font-bold text-primary">
                            {match.home_score} - {match.away_score}
                          </span>
                        ) : (
                          <span className="text-textMuted">Not entered</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {match.is_locked ? (
                          <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                            Locked
                          </span>
                        ) : (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          {!match.result_entered && (
                            <button
                              onClick={() => {
                                const homeScore = prompt('Home score:');
                                const awayScore = prompt('Away score:');
                                if (homeScore !== null && awayScore !== null) {
                                  fetch(`/api/admin/scoring`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      match_id: match.id,
                                      home_score: parseInt(homeScore),
                                      away_score: parseInt(awayScore),
                                    }),
                                  }).then(() => window.location.reload());
                                }
                              }}
                              className="btn-secondary text-sm py-1 px-3"
                            >
                              Enter Result
                            </button>
                          )}
                          <form action="/api/admin/toggle-lock" method="POST">
                            <input type="hidden" name="match_id" value={match.id} />
                            <input type="hidden" name="locked" value={(!match.is_locked).toString()} />
                            <button type="submit" className="btn-secondary text-sm py-1 px-3">
                              {match.is_locked ? 'Unlock' : 'Lock'}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-textMuted">No matches added yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}