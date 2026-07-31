'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ScrollHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3">

        {/* Three-column grid: [left] [logo] [right] — logo is always mathematically centred */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

          {/* LEFT — mobile burger on mobile, social icons on desktop */}
          <div className="flex items-center gap-3">
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
            {/* Social icons on desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <a href="https://x.com/playpredictwin" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
                className="text-textMuted hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/thefootballpredictorleague/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-textMuted hover:text-[#E4405F] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/TheFootballPredictorLeague" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="text-textMuted hover:text-[#1877F2] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* CENTRE — logo, always centred regardless of column widths */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/logos/logo3.jpg"
              alt="Play Predict Win"
              width={200}
              height={67}
              className="object-contain w-[100px] sm:w-[180px]"
              style={{ maxHeight: '56px' }}
            />
          </Link>

          {/* RIGHT — auth buttons on desktop only. Mobile uses the NavBar burger.
            NavBar is sticky and always visible, so ScrollHeader doesn't need a mobile burger. */}
          <div className="flex items-center justify-end gap-2">
            {/* Desktop */}
            <Link href="/auth/login"
              className="hidden sm:inline text-textMuted hover:text-text transition-colors font-medium text-sm whitespace-nowrap">
              Sign In
            </Link>
            <Link href="/auth/signup"
              className="hidden sm:inline btn-primary px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
              Join the League
            </Link>
          </div>

        </div>
      </div>


    </header>
  );
}
