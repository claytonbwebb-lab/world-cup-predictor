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
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/images/logos/logo3.jpg" alt="Play Predict Win" width={260} height={87}
            className="object-contain" style={{ maxHeight: '66px' }} />
        </Link>

        {/* Desktop social links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" aria-label="Facebook" className="text-textMuted hover:text-[#1877F2] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" className="text-textMuted hover:text-[#E4405F] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.163 4.052.018 6.284 0 6.734 0 12c0 5.266.014 5.716.163 7.948.113 1.363.402 2.423 2.89 2.823 1.32.216 4.478.253 7.947.253 5.266 0 5.716-.014 7.948-.163 1.489-.401 2.423-.402 2.89-.402 1.363 0 1.813.013 2.823.163 1.363.113 2.777.402 2.89.402 1.363 0 1.813-.013 2.823-.163 1.363-.113 2.777-.402 2.89-.402C24.014 6.734 24 6.284 24 12c0 5.266-.014 5.716-.163 7.948-.113 1.363-.402 2.423-2.89 2.823C19.612 2.173 14.484 2.163 12 2.163M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
          <a href="#" aria-label="X (Twitter)" className="text-textMuted hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
          <Link href="/auth/login"
            className="text-textMuted hover:text-text transition-colors font-medium whitespace-nowrap">
            Sign In
          </Link>
          <Link href="/auth/signup"
            className="btn-primary px-2 sm:px-4 py-2 rounded-lg font-bold whitespace-nowrap">
            Join the League
          </Link>
        </div>

      </div>
    </header>
  );
}
