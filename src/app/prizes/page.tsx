'use client';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const prizes = [
  {
    title: 'Weekly Prize',
    amount: '£50',
    description: 'Every week, the player at the top of the weekly leaderboard wins £50 cash.',
    icon: '🎯',
    badge: 'Every week',
  },
  {
    title: 'Monthly Podium',
    amount: '£100',
    description: '1st place in the monthly leaderboard wins £100. 2nd place takes £50, and 3rd place gets £25.',
    icon: '🏆',
    badge: 'Monthly',
    tiers: [
      { pos: '1st', amount: '£100', medal: '🥇' },
      { pos: '2nd', amount: '£50', medal: '🥈' },
      { pos: '3rd', amount: '£25', medal: '🥉' },
    ],
  },
  {
    title: 'Season Champion',
    amount: '£500',
    description: 'The player with the most points across the entire 2026/27 season wins the big prize.',
    icon: '⭐',
    badge: 'End of season',
    tiers: [
      { pos: '1st', amount: '£500', medal: '🥇' },
      { pos: '2nd', amount: '£250', medal: '🥈' },
      { pos: '3rd', amount: '£100', medal: '🥉' },
    ],
  },
];

export default function PrizesPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-4">
            💰 Cash prizes every week
          </div>
          <h1 className="text-4xl font-black mb-3">Prizes</h1>
          <p className="text-textMuted text-lg max-w-xl mx-auto">
            Predict scores, climb the leaderboard, and win real cash. No tricks — just rewards for being brilliant at football.
          </p>
        </div>

        <div className="space-y-5">
          {prizes.map(prize => (
            <div key={prize.title} className="card border-primary/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{prize.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-xl font-black">{prize.title}</h2>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {prize.badge}
                    </span>
                  </div>
                  <p className="text-textMuted text-sm leading-relaxed">{prize.description}</p>
                </div>
              </div>

              {prize.tiers ? (
                <div className="flex flex-wrap gap-3 mt-4">
                  {prize.tiers.map(t => (
                    <div key={t.pos} className="flex items-center gap-2 bg-surfaceLight rounded-xl px-4 py-2.5 flex-1 min-w-[120px]">
                      <span className="text-2xl">{t.medal}</span>
                      <div>
                        <div className="text-xs text-textMuted font-medium">{t.pos}</div>
                        <div className="text-lg font-black text-primary">{t.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 bg-surfaceLight rounded-xl px-5 py-3">
                  <span className="text-2xl font-black text-primary">{prize.amount}</span>
                  <span className="text-sm text-textMuted">paid to weekly winner</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 card bg-surfaceLight/50 border-primary/20 text-center">
          <p className="text-textMuted text-sm leading-relaxed">
            All prizes are paid by bank transfer. Winners will be contacted at the end of each week, month, and the season.
            <br />
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">Sign up free →</Link> and start predicting to win.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/fixtures" className="btn-primary px-8 py-3 rounded-xl font-bold">
            View Fixtures →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}