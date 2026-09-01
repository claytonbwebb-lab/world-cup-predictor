'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { findTeam } from '@/lib/teams';
import Link from 'next/link';

export default function UserClubBanner() {
  const [userClub, setUserClub] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('favourite_team')
        .eq('id', user.id)
        .single();
      setUserClub(profile?.favourite_team || null);
      setLoading(false);
    }
    check();
  }, []);

  if (loading) return null;
  if (!userClub) return null;

  const team = findTeam(userClub);

  return (
    <>
      <div className="inline-flex items-center gap-3 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary mb-3">
        {team ? (
          <img src={team.badge} alt={userClub} className="w-6 h-6 object-contain" />
        ) : (
          <span>⚽</span>
        )}
        <span>You&apos;re in the Supporter League</span>
      </div>
      <p className="text-textMuted max-w-xl mx-auto">
        Every point you earn as a predictor also counts for{' '}
        <span className="text-textPrimary font-semibold">{userClub}</span>.
        The more correct predictions you make, the higher your club climbs.
      </p>
      <p className="text-textMuted text-xs mt-2">
        <Link href="/profile" className="text-primary hover:underline">
          Change your club in settings →
        </Link>
      </p>
    </>
  );
}
