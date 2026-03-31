import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #22c55e 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, #22c55e 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              FIFA World Cup 2026
            </h1>
            <p className="text-xl md:text-2xl text-textMuted mb-4">
              Prediction League
            </p>
            <p className="text-lg text-textMuted max-w-2xl mx-auto mb-12">
              Predict match scores, compete with friends on leaderboards, 
              and prove you&apos;re the ultimate football pundit!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link href="/auth/login" className="btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Predict Scores</h3>
            <p className="text-textMuted">
              Submit your score predictions for every World Cup match before kickoff.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card text-center">
            <div className="text-4xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold mb-3">Earn Points</h3>
            <p className="text-textMuted">
              Get 3 points for exact scores, 1 point for correct results. Climb the leaderboard!
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">Join Leagues</h3>
            <p className="text-textMuted">
              Create private leagues and compete with friends, family, or colleagues.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-textMuted">
          <p>2026 FIFA World Cup Prediction League</p>
        </div>
      </footer>
    </div>
  );
}