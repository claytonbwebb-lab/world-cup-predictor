import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminMatchTable from './AdminMatchTable';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/admin');
  }

  // Check if user is admin from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

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
                <input type="text" name="home_team" required className="input w-full" placeholder="Argentina" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Team</label>
                <input type="text" name="away_team" required className="input w-full" placeholder="Brazil" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Home Flag (emoji)</label>
                <input type="text" name="home_flag" className="input w-full" placeholder="🇦🇷" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Flag (emoji)</label>
                <input type="text" name="away_flag" className="input w-full" placeholder="🇧🇷" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group/Stage</label>
                <input type="text" name="group_stage" className="input w-full" placeholder="Group A, Quarter-final, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kickoff</label>
                <input type="datetime-local" name="kickoff_at" required className="input w-full" />
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Match</button>
          </form>
        </div>

        {/* Matches Management */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Manage Matches</h2>
          <AdminMatchTable matches={matches || []} />
        </div>
      </main>
    </div>
  );
}
