import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { type Metadata } from 'next';
import AdminMatchTable from './AdminMatchTable';
import AddMatchForm from './AddMatchForm';
import FixtureActions from './FixtureActions';
import NavBar from '@/components/NavBar';

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

  // Fetch all matches for admin — visible and staged/hidden together.
  // Public/user pages still filter hidden matches out.
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  // Build distinct sorted week list
  const allWeeks = Array.from(new Set((allMatches || [])
    .map(m => m.week_number)
    .filter(w => w !== null)
  )).sort((a, b) => b - a);

  // Filter by week only; admin always sees both live and staged matches.
  let matches = allMatches || [];

  if (selectedWeek) {
    matches = matches.filter(m => m.week_number === selectedWeek);
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

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
          <FixtureActions />
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
