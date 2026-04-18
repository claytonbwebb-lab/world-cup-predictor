'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const path = usePathname();
  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors whitespace-nowrap';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-bold flex items-center gap-1.5 shrink-0">
          <span className="text-yellow-400">The Football Predictor League</span>
          <span className="text-text/50">|</span>
          <span className="text-primary">Play Predict Win</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm overflow-x-auto no-scrollbar">
          <Link href="/dashboard"   className={path === '/dashboard'   ? active : inactive}>Dashboard</Link>
          <Link href="/fixtures"    className={path === '/fixtures'    ? active : inactive}>Fixtures</Link>
          <Link href="/leaderboard" className={path === '/leaderboard' ? active : inactive}>Leaderboard</Link>
          <Link href="/leagues"     className={path === '/leagues'     ? active : inactive}>Leagues</Link>
          <Link href="/auth/logout" className={path === '/auth/logout' ? active : inactive}>Sign Out</Link>
        </nav>
      </div>
    </header>
  );
}
