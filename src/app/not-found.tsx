import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32">
      <div className="text-8xl font-black text-primary mb-4">404</div>
      <h1 className="text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-textMuted mb-8 max-w-md">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="btn-primary px-6 py-3 rounded-xl font-bold">
          Back to Home
        </Link>
        <Link href="/leaderboard" className="btn-secondary px-6 py-3 rounded-xl font-bold">
          Leaderboard
        </Link>
      </div>
    </div>
  );
}