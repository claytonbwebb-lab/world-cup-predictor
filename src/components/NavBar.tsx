'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/fixtures',    label: 'Fixtures' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/leagues',     label: 'Leagues' },
  { href: '/blog',        label: 'Blog' },
  { href: '/auth/logout', label: 'Sign Out' },
];

export default function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors whitespace-nowrap';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-sm font-bold flex items-center gap-1.5 shrink-0">
          <span className="text-yellow-400">The Football Predictor League</span>
          <span className="text-text/50">|</span>
          <span className="text-primary">Play Predict Win</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={path === l.href ? active : inactive}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 text-textMuted hover:text-text transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-border px-4 py-3 flex flex-col gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`py-2 ${path === l.href ? active : inactive}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}