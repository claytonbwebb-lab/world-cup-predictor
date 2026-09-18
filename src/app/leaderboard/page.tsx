import type { Metadata } from 'next';
import LeaderboardPageClient from './LeaderboardPageClient';

export const metadata: Metadata = {
  title: 'Prediction League Leaderboard',
  description: 'See who is leading the Play Predict Win Premier League 2026/27 prediction leaderboard, plus weekly and monthly standings.',
  alternates: { canonical: '/leaderboard' },
  openGraph: {
    title: 'Prediction League Leaderboard | Play Predict Win',
    description: 'See who is leading the Premier League 2026/27 prediction leaderboard, plus weekly and monthly standings.',
    type: 'website',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardPageClient />;
}
