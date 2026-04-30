'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

export default function Footer() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would send to an API route
    setSubmitted(true);
  };

  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Brand + social */}
          <div>
            <Image
              src="/images/logos/logo3.jpg"
              alt="Play Predict Win"
              width={160}
              height={54}
              className="object-contain mb-4"
              style={{ maxHeight: '48px' }}
            />
            <p className="text-textMuted text-sm mb-4">
              The official World Cup 2026 prediction league. Compete with friends, predict every score, climb the leaderboard.
            </p>
            <div className="flex gap-3">
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

          {/* Quick links */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-textMuted">Navigate</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/leaderboard" className="text-textMuted hover:text-text transition-colors">Leaderboard</Link>
              <Link href="/fixtures" className="text-textMuted hover:text-text transition-colors">Fixtures</Link>
              <Link href="/leagues" className="text-textMuted hover:text-text transition-colors">Leagues</Link>
              <Link href="/blog" className="text-textMuted hover:text-text transition-colors">Blog</Link>
              <Link href="/partners" className="text-textMuted hover:text-text transition-colors">Partners</Link>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-textMuted">Contact Us</h3>
            {submitted ? (
              <p className="text-primary text-sm">Thanks! We&apos;ll be in touch soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text placeholder-textMuted/50 focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text placeholder-textMuted/50 focus:outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Your message"
                  required
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text placeholder-textMuted/50 focus:outline-none focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  className="btn-primary py-2 text-sm rounded-lg"
                >
                  Send Message
                </button>
              </form>
            )}
            <p className="text-textMuted text-xs mt-3">or email <a href="mailto:partners@playpredictwin.com" className="text-primary hover:underline">partners@playpredictwin.com</a></p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-textMuted">
          <span>World Cup 2026 Prediction League</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-text transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}