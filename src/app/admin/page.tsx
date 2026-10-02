import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { type Metadata } from 'next';
import AdminMatchTable from './AdminMatchTable';
import AddMatchForm from './AddMatchForm';
import FixtureActions from './FixtureActions';
import NavBar from '@/components/NavBar';
import NotificationsClient from '@/components/NotificationsClient';
import { getWeekNumber } from '@/lib/weeks';

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

  // Fetch all matches for admin — visible and staged/hidden together.
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  // Build distinct sorted week list
  const allWeeks = Array.from(new Set((allMatches || [])
    .map(m => m.week_number)
    .filter(w => w !== null)
  )).sort((a, b) => b - a);

  // Await searchParams to get tab + week filter
  const sp = await searchParams ?? {};
  const tab = sp.tab === 'notifications' ? 'notifications' : 'matches';
  const currentWeek = getWeekNumber(new Date());
  // Default to the furthest future week with matches, or current week
  const defaultWeek = allWeeks.find(w => w >= currentWeek) || currentWeek;
  const selectedWeek = sp.week ? Number(sp.week) : defaultWeek;

  // Filter by week only; admin always sees both live and staged matches.
  let matches = allMatches || [];

  if (selectedWeek) {
    matches = matches.filter(m => m.week_number === selectedWeek);
  }

  const tabCls = (active: boolean) =>
    active
      ? 'px-4 py-2 rounded-lg bg-primary/20 text-primary font-semibold border border-primary/30'
      : 'px-4 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 border border-transparent transition-colors';

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>⚙️</span> Admin Panel
          </h1>
          <div className="flex gap-2 text-sm">
            <a href="/admin" className={tabCls(tab === 'matches')} aria-current={tab === 'matches' ? 'page' : undefined}>
              ⚽ Matches
            </a>
            <a href="/admin?tab=notifications" className={tabCls(tab === 'notifications')} aria-current={tab === 'notifications' ? 'page' : undefined}>
              🔔 Notifications
            </a>
          </div>
        </div>

        {tab === 'notifications' ? (
          <NotificationsClient />
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
