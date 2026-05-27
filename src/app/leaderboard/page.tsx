import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const PAGE_SIZE = 25;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.playpredictwin.com" },
    { "@type": "ListItem", "position": 2, "name": "Leaderboard", "item": "https://www.playpredictwin.com/leaderboard" },
  ],
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function pageUrl(page: number) {
  return `/leaderboard?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: Array<number | 'ellipsis'> = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  pages.push(1);

  if (currentPage > 4) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page || '1', 10);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { count } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });

  const totalUsers = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number.isNaN(requestedPage) ? 1 : requestedPage), totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch leaderboard data for the current page.
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_points', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const { data: allRanks } = await supabase
    .from('leaderboard')
    .select('user_id')
    .order('total_points', { ascending: false });

  const userRank = allRanks?.findIndex((entry) => entry.user_id === user.id);
  let userEntry = leaderboard?.find((entry) => entry.user_id === user.id);

  if (!userEntry) {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    userEntry = data ?? undefined;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <span>🥇</span> Global Leaderboard
        </h1>

        {/* Prizes banner */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { pos: '🥇 1st', prize: '£250', bg: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/40 text-yellow-400' },
            { pos: '🥈 2nd', prize: '£100', bg: 'from-gray-400/10 to-gray-500/5 border-gray-400/30 text-gray-300' },
            { pos: '🥉 3rd', prize: '£50', bg: 'from-orange-600/10 to-orange-700/5 border-orange-600/30 text-orange-400' },
          ].map(p => (
            <div key={p.pos} className={`flex items-center gap-2 border rounded-xl px-5 py-2 bg-gradient-to-r ${p.bg}`}>
              <span className="font-bold text-sm">{p.pos}</span>
              <span className="font-black text-lg">{p.prize}</span>
            </div>
          ))}
        </div>

        {/* User's Rank Summary */}
        {userEntry && (
          <div className="card mb-8 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textMuted text-sm">Your Position</p>
                <p className="text-3xl font-bold">
                  {userRank !== undefined ? userRank + 1 : '-'}
                  <span className="text-textMuted text-lg font-normal"> / {totalUsers}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Total Points</p>
                <p className="text-2xl font-bold text-primary">{userEntry.total_points}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Exact Scores</p>
                <p className="text-2xl font-bold text-warning">{userEntry.exact_scores}</p>
              </div>
              <div className="text-right">
                <p className="text-textMuted text-sm">Correct Results</p>
                <p className="text-2xl font-bold">{userEntry.correct_results}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-textMuted font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-textMuted font-medium">Player</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Points</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Exact</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Results</th>
                <th className="text-center py-3 px-4 text-textMuted font-medium">Predictions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry, index) => {
                const rank = offset + index + 1;

                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b border-border/50 hover:bg-surfaceLight/50 transition-colors ${
                      entry.user_id === user.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8">
                        {rank === 1 && <span className="text-2xl">🥇</span>}
                        {rank === 2 && <span className="text-2xl">🥈</span>}
                        {rank === 3 && <span className="text-2xl">🥉</span>}
                        {rank > 3 && <span className="text-textMuted">{rank}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.avatar_url || '/default-avatar.png'}
                          alt={entry.username}
                          className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className={`font-medium ${entry.user_id === user.id ? 'text-primary' : ''}`}>
                            {entry.username}
                          </span>
                          {entry.user_id === user.id && (
                            <span className="text-xs text-primary">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xl font-bold text-primary">{entry.total_points}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-warning font-medium">{entry.exact_scores}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-textMuted">{entry.correct_results}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-textMuted">{entry.total_predictions}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-textMuted">No predictions yet</p>
              <p className="text-textMuted text-sm">Be the first to make a prediction!</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Leaderboard pages">
            <Link
              href={pageUrl(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={`btn-secondary px-4 py-2 text-sm ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Previous
            </Link>

            {visiblePages.map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-textMuted">
                  ...
                </span>
              ) : (
                <Link
                  key={page}
                  href={pageUrl(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={`min-w-10 rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface hover:bg-surfaceLight text-text'
                  }`}
                >
                  {page}
                </Link>
              )
            ))}

            <Link
              href={pageUrl(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={`btn-secondary px-4 py-2 text-sm ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Next
            </Link>

            <span className="w-full text-center text-sm text-textMuted sm:w-auto sm:pl-2">
              {totalUsers} players
            </span>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
