'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const path = usePathname();
  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold flex items-center gap-2 shrink-0">
          <span>🏆</span><span>World Cup Predictor</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/dashboard"   className={path === '/dashboard'   ? active : inactive}>Dashboard</Link>
          <Link href="/fixtures"    className={path === '/fixtures'    ? active : inactive}>Fixtures</Link>
          <Link href="/leaderboard" className={path === '/leaderboard' ? active : inactive}>Leaderboard</Link>
          <Link href="/leagues"     className={path === '/leagues'     ? active : inactive}>Leagues</Link>
          <Link href="/auth/logout" className={inactive}>Sign Out</Link>
        </nav>
      </div>
    </header>
  );
}
