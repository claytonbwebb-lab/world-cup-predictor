'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/',        label: 'Home' },
  { href: '/blog',    label: 'Blog' },
  { href: '/auth/signup', label: 'Sign Up' },
  { href: '/auth/login', label: 'Login' },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">

        {/* Three-column grid: [left] [logo] [right] — logo always mathematically centred */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* LEFT — empty spacer on mobile, space for balance on desktop */}
          <div />

          {/* CENTRE — logo, always centred */}
          <Link href="/" className="flex items-center gap-1.5 font-bold text-sm whitespace-nowrap">
            <span className="text-yellow-400">The Football Predictor League</span>
            <span className="text-text/50 hidden sm:inline">|</span>
            <span className="text-primary hidden sm:inline">Play Predict Win</span>
          </Link>

          {/* RIGHT — desktop nav / mobile burger */}
          <div className="flex items-center justify-end gap-4">
            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={path === l.href ? active : inactive}
                >
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
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
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
