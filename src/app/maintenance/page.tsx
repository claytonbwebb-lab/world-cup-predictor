import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Maintenance — Play Predict Win',
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background text-text flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <div className="text-5xl">⚽</div>
          <h1 className="text-3xl font-bold text-primary">Play Predict Win</h1>
        </div>

        {/* Maintenance card */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🔧</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text">We&rsquo;ll be back soon</h2>
            <p className="text-textMuted text-sm leading-relaxed">
              We&rsquo;re currently updating the site from the World Cup to the Premier League
              — with new exciting features for the 2026/27 season.
            </p>
            <p className="text-textMuted text-sm leading-relaxed">
              Should only be a few minutes. Thanks for your patience!
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-textMuted">
              If you&rsquo;re seeing this and you&rsquo;re an admin, visit this page with
              your bypass password as a query param:{' '}
              <code className="bg-surfaceLight px-1.5 py-0.5 rounded text-text text-xs">
                ?__maint_bypass=YOURPASSWORD
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-textMuted text-xs">
          Questions? Get in touch at{' '}
          <a href="mailto:hello@playpredictwin.com" className="text-primary hover:underline">
            hello@playpredictwin.com
          </a>
        </p>
      </div>
    </main>
  );
}
