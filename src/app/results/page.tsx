import type { Metadata } from 'next';
import ResultsPageClient from './ResultsPageClient';

export const metadata: Metadata = {
  title: 'Premier League Results & Scores',
  description: 'View all Premier League 2026/27 match results, scores, and prediction outcomes. See how your predictions performed.',
  alternates: { canonical: '/results' },
  openGraph: {
    title: 'Premier League Results & Scores | Play Predict Win',
    description: 'View all Premier League 2026/27 match results, scores, and prediction outcomes.',
    type: 'website',
  },
};

export default function ResultsPage() {
  return <ResultsPageClient />;
}
