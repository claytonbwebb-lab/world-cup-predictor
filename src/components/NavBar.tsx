'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

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
    href: 'https://www.instagram.com/thefootballpredictorleague/',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/TheFootballPredictorLeague',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

// ── Nav link types ──────────────────────────────────────────────
interface NavLink {
  href: string;
  label: string;
}
interface DropdownItem {
  href: string;
  label: string;
}

export default function NavBar() {
  const path = usePathname();
  const supabase = createClient();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = loading
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLeaderboardOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const active = 'text-primary font-semibold';
  const inactive = 'text-textMuted hover:text-text transition-colors whitespace-nowrap';

  // ── Link sets ─────────────────────────────────────────────────
  const baseLinks: NavLink[] = [
    { href: '/',         label: 'Home' },
    { href: '/fixtures', label: 'Fixtures' },
    { href: '/results',  label: 'Results' },
  ];

  const leaderboardDropdownItems: DropdownItem[] = [
    { href: '/leaderboard',       label: 'Global Leaderboard' },
    { href: '/supporter-league', label: 'Supporter League' },
    { href: '/leagues',          label: 'Mini-Leagues' },
  ];

  const loggedOutLinks: NavLink[] = [
    ...baseLinks,
    { href: '/blog',      label: 'Blog' },
    { href: '/partners',  label: 'Partners' },
    { href: '/auth/signup', label: 'Sign Up' },
    { href: '/auth/login',  label: 'Login' },
  ];

  const loggedInLinks: NavLink[] = [
    ...baseLinks,
    { href: '/profile',    label: 'Profile' },
    { href: '/auth/logout', label: 'Sign Out' },
  ];

  const navLinks = loggedIn ? loggedInLinks : loggedOutLinks;
  const isOnLeaderboard = path === '/leaderboard' || path === '/supporter-league' || path === '/leagues';

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* LEFT — mobile burger / social icons on desktop */}
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden p-2 text-textMuted hover:text-text transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-3">
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="text-textMuted hover:text-primary transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* CENTRE — logo */}
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

          {/* RIGHT — desktop nav */}
          <div className="flex items-center justify-end gap-4">
            <nav className="hidden sm:flex items-center gap-1 text-sm">

              {/* Base links */}
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-lg ${path === l.href ? active : inactive}`}
                >
                  {l.label}
                </Link>
              ))}

              {/* Leaderboards dropdown — always visible, items vary by auth */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setLeaderboardOpen(o => !o)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 ${isOnLeaderboard ? active : inactive}`}
                >
                  Leaderboards
                  <svg className={`w-3 h-3 transition-transform ${leaderboardOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {leaderboardOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl py-2 z-50">
                    {leaderboardDropdownItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setLeaderboardOpen(false)}
                        className={`block px-4 py-2.5 text-sm ${path === item.href ? 'text-primary font-semibold' : 'text-textMuted hover:text-text hover:bg-surfaceLight'} transition-colors`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </nav>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border px-4 py-3 flex flex-col gap-1">
          {/* Base links */}
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`py-2.5 ${path === l.href ? active : inactive}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {/* Leaderboards section */}
          <div className="pt-2 pb-1">
            <span className="text-xs text-textMuted uppercase tracking-wider px-1">Leaderboards</span>
          </div>
          {leaderboardDropdownItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-2 pl-3 ${path === item.href ? active : inactive}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
