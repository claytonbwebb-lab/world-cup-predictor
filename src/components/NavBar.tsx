'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/fixtures',    label: 'Fixtures' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/leagues',     label: 'Leagues' },
  { href: '/partners',    label: 'Partners' },
  { href: '/blog',        label: 'Blog' },
  { href: '/auth/logout', label: 'Sign Out' },
];

const socialLinks = [
  {
    name: 'X / Twitter',
    href: 'https://x.com/playpredictwin',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/playpredictwin',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@playpredictwin',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors whitespace-nowrap';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">

      {/* ── Main bar ── */}
      <div className="max-w-6xl mx-auto px-4 py-3">

        {/* Three-column grid: [left] [logo] [right] */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* LEFT — social icons (desktop) / invisible spacer (mobile) */}
          <div className="flex items-center gap-3">
            {socialLinks.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="hidden sm:flex text-textMuted hover:text-primary transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* CENTRE — logo image, always centred */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/logos/logo3.jpg"
              alt="Play Predict Win"
              width={200}
              height={67}
              className="object-contain w-[100px] sm:w-[180px]"
              style={{ maxHeight: '52px' }}
            />
          </Link>

          {/* RIGHT — desktop nav / mobile burger */}
          <div className="flex items-center justify-end gap-4">
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

      {/* ── Mobile dropdown ── */}
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
