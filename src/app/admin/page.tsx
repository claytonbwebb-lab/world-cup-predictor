import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminMatchTable from './AdminMatchTable';
import AddMatchForm from './AddMatchForm';

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
          <AddMatchForm />
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
