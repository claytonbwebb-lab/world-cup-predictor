import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import NotificationBannerList from '@/components/NotificationBannerList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notification Test 2 — PlayPredictWin',
  description: 'Test page for the notification banner system.',
  robots: { index: false, follow: false },
};

export default function NotificationTest2Page() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* ===== LIVE NOTIFICATION BANNER ===== */}
      <NotificationBannerList />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Notification Banner Test Page 👋
          </h1>
          <p className="text-textMuted">
            This page renders live notifications from the database via{' '}
            <code className="text-xs bg-surfaceLight px-1 py-0.5 rounded">NotificationBannerList</code>.
            Notifications are dismissed per-user and reappear based on the dismissal mode and timer.
            Admin controls are in{' '}
            <a href="/admin/notifications" className="text-primary underline">/admin/notifications</a>.
          </p>
          <p className="text-textMuted mt-2 text-sm">
            Notifications are only visible here on this test page — not on any other part of the site yet.
          </p>
        </div>

        {/* Dummy Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Points', val: 47 },
            { label: 'Predictions', val: 12 },
            { label: 'Exact Scores', val: 3 },
            { label: 'Correct', val: 5 },
            { label: 'Rank', val: 128 },
          ].map((s) => (
            <div key={s.label} className="card">
              <p className="text-textMuted text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-primary">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Test Controls */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Testing Controls</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/admin/notifications"
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Admin Panel →
            </a>
            <a
              href="/api/notifications"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Raw API Response
            </a>
          </div>
        </div>

        {/* Dummy Content Blocks */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Upcoming Fixtures</h2>
            <div className="space-y-3">
              {[
                { home: 'Arsenal', away: 'Liverpool', date: 'Sat 28 Sep, 15:00' },
                { home: 'Man City', away: 'Newcastle', date: 'Sat 28 Sep, 17:30' },
                { home: 'Chelsea', away: 'Brighton', date: 'Sun 29 Sep, 14:00' },
              ].map((m) => (
                <div key={m.home + m.away} className="flex items-center gap-2 p-3 bg-surfaceLight rounded-lg">
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium">{m.home}</span>
                  </div>
                  <span className="text-textMuted text-xs">vs</span>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium">{m.away}</span>
                  </div>
                  <span className="text-[10px] text-textMuted">{m.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Results</h2>
            <div className="space-y-2">
              {[
                { home: 'Spurs', away: 'Man Utd', pred: '2-1', actual: '1-1', pts: 1 },
                { home: 'Everton', away: 'Crystal Palace', pred: '0-0', actual: '2-1', pts: 0 },
                { home: 'West Ham', away: 'Ipswich', pred: '3-1', actual: '3-1', pts: 3 },
              ].map((r) => (
                <div key={r.home + r.away} className="grid grid-cols-[1fr_4rem_4rem_1fr_auto] items-center gap-2 p-3 bg-surfaceLight rounded-lg">
                  <span className="text-xs text-right">{r.home}</span>
                  <div className="text-center">
                    <div className="text-[10px] text-textMuted">Predicted</div>
                    <div className="text-sm font-medium">{r.pred}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-textMuted">Actual</div>
                    <div className="text-sm font-bold text-primary">{r.actual}</div>
                  </div>
                  <span className="text-xs">{r.away}</span>
                  <span className="font-bold text-primary">+{r.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Test */}
        <div className="mt-12 card">
          <h2 className="text-xl font-bold mb-4">Scroll Test</h2>
          <p className="text-textMuted mb-4">
            The banner should stay fixed at the top as you scroll. Dismiss it and reload to bring it back.
            For temporary dismissals, it will reappear after the configured reappear time.
          </p>
          <div className="space-y-4 text-textMuted text-sm">
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
