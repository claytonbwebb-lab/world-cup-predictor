import type { Metadata } from 'next';
import LeaguesPageClient from './LeaguesPageClient';

export const metadata: Metadata = {
  title: 'Private Leagues & Prediction Groups',
  description: 'Create private prediction leagues for you and your friends, or join public leagues. Compete together in the Premier League 2026/27 season.',
  alternates: { canonical: '/leagues' },
  openGraph: {
    title: 'Private Leagues & Prediction Groups | Play Predict Win',
    description: 'Create private prediction leagues for you and your friends, or join public leagues.',
    type: 'website',
  },
};

export default function LeaguesPage() {
  return <LeaguesPageClient />;
}
