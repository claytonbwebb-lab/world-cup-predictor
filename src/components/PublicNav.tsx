import Link from 'next/link';

export default function PublicNav() {
  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-bold flex items-center gap-1.5 shrink-0">
          <span className="text-yellow-400">The Football Predictor League</span>
          <span className="text-text/50">|</span>
          <span className="text-primary">Play Predict Win</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/blog" className="text-textMuted hover:text-text transition-colors">Blog</Link>
          <Link href="/auth/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">Sign Up</Link>
          <Link href="/auth/login" className="text-textMuted hover:text-text transition-colors">Login</Link>
        </nav>
      </div>
    </header>
  );
}