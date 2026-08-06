'use client';

import FavouriteTeamPrompt from '@/components/FavouriteTeamPrompt';
import Link from 'next/link';

interface SupporterLeagueBannerProps {
  hasFavouriteTeam: boolean;
}

export default function SupporterLeagueBanner({ hasFavouriteTeam }: SupporterLeagueBannerProps) {
  if (hasFavouriteTeam) {
    return (
      <Link
        href="/supporter-league"
        className="block bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-5 hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="font-bold text-textPrimary">Introducing the Supporter League</h3>
            <p className="text-sm text-textMuted">
              Every point you earn counts for your club. See which club&apos;s fans are the best predictors.
            </p>
          </div>
        </div>
        <span className="text-primary text-sm font-medium">View the Supporter League →</span>
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/supporter-league"
        className="block bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-5 mb-4 hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="font-bold text-textPrimary">Join the Supporter League</h3>
            <p className="text-sm text-textMuted">
              Every point you earn counts for your club. Select your favourite club to get started.
            </p>
          </div>
        </div>
        <span className="text-primary text-sm font-medium mt-1 block">Join the Supporter League →</span>
      </Link>
      <FavouriteTeamPrompt />
    </>
  );
}
