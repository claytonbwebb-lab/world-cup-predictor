import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { type Metadata } from 'next';
import AdminMatchTable from './AdminMatchTable';
import AddMatchForm from './AddMatchForm';

export default async function AdminPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
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

  // Await searchParams to get week filter
  const sp = await searchParams ?? {};
  const selectedWeek = sp.week ? Number(sp.week) : null;

  // Fetch all matches (to build week list)
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  // Build distinct sorted week list
  const allWeeks = Array.from(new Set((allMatches || [])
    .map(m => m.week_number)
    .filter(w => w !== null)
  )).sort((a, b) => b - a);

  // Filter matches by week if selected
  const matches = selectedWeek
    ? (allMatches || []).filter(m => m.week_number === selectedWeek)
    : (allMatches || []);

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
          <AdminMatchTable
            matches={matches}
            availableWeeks={allWeeks as number[]}
            selectedWeek={selectedWeek}
          />
        </div>
      </main>
    </div>
  );
}
