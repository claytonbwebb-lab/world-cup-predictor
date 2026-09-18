import type { Metadata } from 'next';
import FixturesPageClient from './FixturesPageClient';

export const metadata: Metadata = {
  title: 'Premier League Fixtures & Predictions',
  description: 'Every Premier League 2026/27 fixture with kick-off times. Lock in your score predictions before kick-off and earn points.',
  alternates: { canonical: '/fixtures' },
  openGraph: {
    title: 'Premier League Fixtures & Predictions | Play Predict Win',
    description: 'Every Premier League 2026/27 fixture with kick-off times. Lock in your score predictions before kick-off and earn points.',
    type: 'website',
  },
};

export default function FixturesPage() {
  return <FixturesPageClient />;
}
