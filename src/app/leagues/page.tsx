import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function LeaguesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's leagues
  const { data: leagueMembers } = await supabase
    .from('league_members')
    .select(`
      *,
      league:leagues(*)
    `)
    .eq('user_id', user.id);

  const myLeagues = leagueMembers?.map((lm) => lm.league) || [];

  // Fetch user's profile to get created leagues
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: createdLeagues } = await supabase
    .from('leagues')
    .select('*')
    .eq('created_by', user.id);

  // Fetch public leagues
  const { data: publicLeagues } = await supabase
    .from('leagues')
    .select('*')
    .eq('is_public', true)
    .neq('created_by', user.id);

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
            <Link href="/fixtures" className="text-textMuted hover:text-text">Fixtures</Link>
            <Link href="/leaderboard" className="text-textMuted hover:text-text">Leaderboard</Link>
            <Link href="/leagues" className="text-primary font-medium">Leagues</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>👥</span> Mini Leagues
          </h1>
          <button
            onClick={() => (window as any).document.getElementById('create-league-modal')?.showModal()}
            className="btn-primary"
          >
            Create League
          </button>
        </div>

        {/* Create League Modal */}
        <dialog id="create-league-modal" className="modal">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New League</h3>
            <form action="/api/leagues" method="POST" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">League Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input w-full"
                  placeholder="My League"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_public"
                  id="is_public"
                  className="rounded"
                />
                <label for="is_public" className="text-sm">Make public (anyone can join)</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => (window as any).document.getElementById('create-league-modal')?.close()}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Join League */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Join a League</h2>
          <form action="/api/leagues/join" method="POST" className="flex gap-2">
            <input
              type="text"
              name="code"
              required
              className="input flex-1"
              placeholder="Enter league code"
            />
            <button type="submit" className="btn-primary">
              Join
            </button>
          </form>
        </div>

        {/* My Leagues */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">My Leagues</h2>
          {myLeagues.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {myLeagues.map((league: any) => (
                <LeagueCard key={league.id} league={league} isOwner={league.created_by === user.id} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-textMuted">You haven&apos;t joined any leagues yet</p>
            </div>
          )}
        </section>

        {/* Public Leagues */}
        {publicLeagues && publicLeagues.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Public Leagues</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {publicLeagues.map((league) => (
                <div key={league.id} className="card">
                  <h3 className="font-bold mb-2">{league.name}</h3>
                  <p className="text-textMuted text-sm mb-4">Created by another player</p>
                  <form action="/api/leagues/join" method="POST">
                    <input type="hidden" name="league_id" value={league.id} />
                    <button type="submit" className="btn-secondary w-full">
                      Request to Join
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function LeagueCard({ league, isOwner }: { league: any; isOwner: boolean }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{league.name}</h3>
          {isOwner && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
              Owner
            </span>
          )}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-textMuted text-sm">
          <span className="font-medium">Code:</span> {league.code}
        </p>
      </div>
      <div className="flex gap-2">
        <Link href={`/leagues/${league.id}`} className="btn-secondary flex-1 text-center">
          View
        </Link>
        {isOwner && (
          <button className="btn-secondary">
            Settings
          </button>
        )}
      </div>
    </div>
  );
}