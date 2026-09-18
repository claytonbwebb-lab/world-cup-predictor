import type { Metadata } from 'next';
import PrizesPageClient from './PrizesPageClient';

export const metadata: Metadata = {
  title: '£50 Weekly, £500 Season Prizes',
  description: 'Win real cash by predicting Premier League scores. £50 weekly, £100 monthly, £500 season winner. Free to play, paid by bank transfer.',
  alternates: { canonical: '/prizes' },
  openGraph: {
    title: '£50 Weekly, £500 Season Prizes | Play Predict Win',
    description: 'Win real cash by predicting Premier League scores. £50 weekly, £100 monthly, £500 season winner. Free to play.',
    type: 'website',
  },
};

export default function PrizesPage() {
  return <PrizesPageClient />;
}
