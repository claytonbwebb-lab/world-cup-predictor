import Link from 'next/link';
import Countdown from '@/components/Countdown';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  // If a magic link code lands on the homepage, forward to the callback handler
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[80vh]">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1637203727700-9d86c74904d6?q=80&w=1920&auto=format&fit=crop"
            alt="World Cup stadium at night with floodlights"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/60 via-[#0f172a]/40 to-[#0f172a]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/60 via-transparent to-[#0f172a]/60" />
        </div>

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex flex-col items-center gap-1 bg-primary/10 border border-primary/30 rounded-full px-5 py-2 text-primary text-sm font-medium mb-8">
            <span>FIFA World Cup 2026</span>
            <span className="text-xs opacity-70">USA · Canada · Mexico</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
            <span className="block text-primary">PLAY</span>
            <span className="block text-text">PREDICT</span>
            <span className="block text-yellow-400">WIN.</span>
          </h1>

          <p className="text-lg text-textMuted max-w-xl mx-auto mb-10 leading-relaxed">
            Call every scoreline. Climb the leaderboard. Show your mates you know football.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="btn-primary text-base px-10 py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              Join the League →
            </Link>
            <Link href="/auth/login"
              className="btn-secondary text-base px-10 py-4 rounded-xl text-lg font-bold">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
            {[
              { val: '48', label: 'Group Matches' },
              { val: '3pts', label: 'Exact Score' },
              { val: '1pt', label: 'Correct Result' },
              { val: '∞', label: 'Bragging Rights' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-primary">{s.val}</div>
                <div className="text-xs text-textMuted uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview ── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">Every Match. Every Score.</h2>
        <p className="text-textMuted text-lg mb-8 leading-relaxed max-w-xl mx-auto">
          From the group stages to the final in New Jersey, predict the exact score for every match 
          and prove you've got what it takes to be a football pundit.
        </p>
        <ul className="flex flex-wrap justify-center gap-4 text-sm">
          {['Predict before kickoff', 'Lock in your scores', 'Watch points roll in', 'Climb the leaderboard', 'Win prizes'].map(item => (
            <li key={item} className="flex items-center gap-2 text-textMuted bg-surface/50 px-4 py-2 rounded-full">
              <span className="text-primary">✓</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── How it works ── */}
      <section className="relative overflow-hidden py-20">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop"
            alt="Football stadium aerial view"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0f172a]/65" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-2">How It Works?</h2>
          <p className="text-textMuted text-center mb-12">Three steps to prediction glory</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create a free account and join a private league with your mates, or compete in the global leaderboard.' },
              { step: '02', title: 'Submit Predictions', desc: 'Pick the exact scoreline for every match before kickoff. Predictions lock the moment the whistle blows.' },
              { step: '03', title: 'Earn Points', desc: 'Exact score = 3 pts. Correct result = 1 pt. Watch yourself climb the leaderboard as results come in.' },
            ].map(item => (
              <div key={item.step} className="card border-primary/40 hover:border-primary/60 transition-colors">
                <div className="text-6xl font-black text-primary mb-2">{item.step}</div>
                <div className="text-3xl mb-4 text-primary">★</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scoring ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <h2 className="text-3xl font-bold text-center mb-2">Scoring System</h2>
        <p className="text-textMuted text-center mb-12">Simple, fair, and rewarding for the bold</p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card border-primary/40 text-center">
            <div className="text-5xl font-black text-primary mb-2">3</div>
            <div className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Points</div>
            <div className="text-textMuted text-sm">Exact scoreline — e.g. you say 2-1, it ends 2-1</div>
          </div>
          <div className="card text-center">
            <div className="text-5xl font-black text-green-400 mb-2">1</div>
            <div className="text-sm font-bold uppercase tracking-widest text-green-400 mb-2">Point</div>
            <div className="text-textMuted text-sm">Correct result — right winner or draw, wrong score</div>
          </div>
          <div className="card text-center">
            <div className="text-5xl font-black text-textMuted mb-2">0</div>
            <div className="text-sm font-bold uppercase tracking-widest text-textMuted mb-2">Points</div>
            <div className="text-textMuted text-sm">Wrong result — back to the drawing board</div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2">Our Partners</h2>
          <p className="text-textMuted text-center mb-10 text-sm">Supported by brands that love football</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {[
              { name: '90s Football', href: 'https://bit.ly/4ceCmeF', src: '/images/partners/90sfootball.png', alt: '90s Football' },
              { name: 'FOOTBALL', href: 'https://bit.ly/4tRRJ2o', src: '/images/partners/footbal12.png', alt: 'FOOTBALL' },
              { name: '3Retro', href: 'https://bit.ly/4dPhtYE', src: '/images/partners/3retro.png', alt: '3Retro' },
              { name: 'Allstar Signings', href: 'https://bit.ly/4sw9t2t', src: '/images/partners/allstarsignings.png', alt: 'Allstar Signings' },
              { name: 'Butterworths', href: 'https://bit.ly/4vv6MAT', src: '/images/partners/butterworths.png', alt: "Butterworth's" },
              { name: 'Retro Football Manager', href: 'https://rfm25.onelink.me/AFls/ppw', src: '/images/partners/rfm.png', alt: 'Retro Football Manager' },
            ].map(partner => (
              <a key={partner.name} href={partner.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-24 px-4 hover:opacity-80 transition-opacity">
                <Image src={partner.src} alt={partner.alt} width={200} height={80}
                  className="max-h-full max-w-[200px] object-contain" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-border bg-surface/30">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-6 text-primary">★</div>
          <h2 className="text-4xl font-black mb-4">Ready to Play?</h2>
          <p className="text-textMuted text-lg mb-8">
            The 2026 World Cup kicks off on 11 June 2026. Get your predictions in early.
          </p>
          <Link href="/auth/signup"
            className="btn-primary px-12 py-4 rounded-xl text-lg font-bold inline-block shadow-lg shadow-primary/20">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Countdown ── */}
      <section className="border-t border-border py-16 text-center">
        <p className="text-textMuted text-sm uppercase tracking-widest mb-6">First match kicks off in</p>
        <Countdown />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-textMuted">
          <span>World Cup 2026 Prediction League</span>
          <div className="flex gap-6">
            <Link href="/leaderboard" className="hover:text-text transition-colors">Leaderboard</Link>
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
            <Link href="/faq" className="hover:text-text transition-colors">FAQ</Link>
            <Link href="/auth/signup" className="hover:text-text transition-colors">Sign Up</Link>
            <Link href="/auth/login" className="hover:text-text transition-colors">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
