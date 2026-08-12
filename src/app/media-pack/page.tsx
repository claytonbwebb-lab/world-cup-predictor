import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Media Pack & Partnerships — PlayPredictWin',
  description:
    'Media pack and commercial partnership opportunities with PlayPredictWin — the Premier League prediction league with 750+ active players, 30,000+ subscribers, and 120 countries.',
  robots: { index: false, follow: false },
};

const stats = [
  { num: '750+', label: 'Active Players' },
  { num: '30k+', label: 'Email Subscribers' },
  { num: '120', label: 'Countries' },
  { num: '85k+', label: 'Digital Interactions' },
];

const tiers = [
  {
    name: 'Main Sponsor',
    title: 'Headline Partner',
    price: '£10,000',
    priceSub: 'full season',
    monthly: '£1,500 / month',
    featured: true,
    items: [
      'Ultimate platform integration — premium brand styling and clickable links on every single web page',
      'Fixed top-billing placement within all automated system and marketing emails',
      'Category exclusivity guaranteed',
      'Direct access to 30k+ subscriber database insights',
    ],
  },
  {
    name: 'Prize Sponsor',
    title: 'Weekly Prize',
    price: '£5,000',
    priceSub: 'full season',
    monthly: '£600 / month',
    featured: false,
    items: [
      'Direct ownership of our weekly contest loop — funding the £50 weekly winner pool',
      'Dominant weekly leaderboard branding',
      'Exposure on score-submission layouts',
      'Mandatory feature block inside weekly winner email alerts',
      'Minimum 4-week commitment if bought monthly',
    ],
  },
  {
    name: 'Prize Sponsor',
    title: 'Monthly Prize',
    price: '£5,000',
    priceSub: 'full season',
    monthly: '£600 / month',
    featured: false,
    items: [
      'Full branding rights to the monthly leaderboard sprint — funding the £175 monthly winner pool',
      'High-visibility position during high-traffic end-of-month score tallies',
      'Dedicated "Manager of the Month" newsletter feature block',
    ],
  },
  {
    name: 'Prize Sponsor',
    title: 'End of Season',
    price: '£5,000',
    priceSub: 'full season',
    featured: false,
    items: [
      'Exclusive anchor branding on our flagship Global Leaderboard all season long',
      'Direct association with the £850 grand prize',
      'Dedicated feature profile and winner presentation graphics',
      'Permanent data capture integrations',
    ],
  },
  {
    name: 'Entry Tier',
    title: 'Partner Brand',
    price: '£2,000',
    priceSub: 'full season',
    monthly: '£250 / month',
    featured: false,
    items: [
      'Permanent feature slot within the dedicated "Partners Section" of the website',
      'Custom brand imagery and 100-word promotional copy',
      'SEO-boosting "Do-Follow" hyperlink',
      'Monthly newsletter sponsor mention',
    ],
  },
];

const aLaCarte = [
  {
    icon: '📧',
    title: 'Solus Email Broadcast',
    price: '£1,500',
    per: 'per send',
    desc: 'A completely dedicated, exclusive HTML broadcast sent directly to our clean database of 30,000+ subscribers. Zero competing advertisements.',
  },
  {
    icon: '🗞️',
    title: 'Monthly Newsletter Banner',
    price: '£300',
    per: 'per issue',
    desc: 'High-visibility graphic leaderboard display (above or between core editorial text) within the monthly PPW newsletter round-up.',
  },
  {
    icon: '✍️',
    title: 'Football Guest Blog Post',
    price: '£200',
    per: 'per post',
    desc: 'A permanent, editorially native article published on the PPW blog. Content must be football-related and can include up to two permanent contextual "Do-Follow" links for SEO authority building.',
  },
  {
    icon: '🔗',
    title: 'Recommended Sites Listing',
    price: '£150',
    per: 'per season',
    desc: 'A static text and hyperlink placement on our high-authority "Useful Links / Resources" widget or footer roster for the full 12 months.',
  },
  {
    icon: '📱',
    title: 'App Title Sponsorship',
    price: 'POA',
    per: '',
    desc: 'Custom-built integration opportunities for our dedicated mobile application, currently deep in active development. Price on application.',
  },
];

export default function MediaPackPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#1a3a2a_0%,#0f172a_70%)]" />
        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-block bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
            📋 Media Pack · 2026/27 Season
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight mb-4">
            PLAY<br />
            <span className="text-primary">PREDICT</span><br />
            WIN
          </h1>
          <p className="text-xl md:text-2xl text-textMuted font-medium mt-6 mb-10">
            Media Pack &amp; Commercial Partnerships
          </p>
          <a
            href="mailto:partners@playpredictwin.com"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-black font-bold text-lg px-10 py-4 rounded-full transition-all hover:-translate-y-0.5"
          >
            👋 Partner With Us
          </a>
        </div>
        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-textMuted text-xs tracking-widest uppercase opacity-50 animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface py-10 md:py-14 text-center">
            <div className="text-4xl md:text-5xl lg:text-6xl font-black text-primary font-heading">
              {s.num}
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-textMuted mt-2">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── EXEC SUMMARY ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
          01 · The Opportunity
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-8 font-heading">
          The <span className="text-primary">PlayPredictWin</span> Advantage
        </h2>
        <div className="space-y-5 text-textMuted text-lg leading-relaxed">
          <p>
            PlayPredictWin (PPW) is a premier, free-to-play football prediction platform built
            by fans, for fans. Our core philosophy is simple: zero barriers to entry. We provide
            a highly engaging, frictionless environment where football enthusiasts across the globe
            can test their match-prediction instincts, compete in custom leagues, and win premium prizes.
          </p>
          <p>
            Behind PPW is a leadership team with <strong className="text-text">over 20 years</strong> of
            deep-rooted experience within the football industry. This footprint gives us an
            unparalleled, active network of football clubs, commercial partners, tier-one social media
            influencers, and sports bloggers. We continually leverage this network to drive high-velocity
            user acquisition, ensuring our partners receive active, compounding exposure throughout
            the domestic campaign.
          </p>
        </div>

        {/* Mutual Growth callout */}
        <div className="mt-10 border-l-4 border-primary rounded-r-2xl bg-primary/5 px-8 py-7">
          <p className="text-text font-bold text-lg mb-2">Our Mutual Growth Philosophy</p>
          <p className="text-textMuted leading-relaxed">
            We view commercial relationships not as static, short-term transactions, but as long-term
            strategic alliances. By embedding your brand into our infrastructure from day one, your
            visibility, audience reach, and customer acquisition metrics will{' '}
            <strong className="text-text">scale automatically</strong> alongside our platform's user
            acquisition curve.
          </p>
        </div>

        {/* Key highlights */}
        <div className="mt-10 flex flex-wrap gap-3">
          {[
            'UK-Anchored Audience',
            '6,000+ Monthly Visits',
            'High-Utility Retention Tech',
            'Private League Virality',
            'Clean, Targetable Database',
          ].map((b) => (
            <span
              key={b}
              className="flex items-center gap-2 bg-surface border border-border rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
            02 · The Platform
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-heading">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-textMuted text-lg mb-14 max-w-xl">
            Three steps to prediction glory. PPW keeps mechanics deliberately familiar — players
            know exactly what to expect every single week.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                icon: '👤',
                title: 'Sign Up',
                body: 'Create a free account and set up a private league with your mates, or select a public leaderboard to join. Zero friction, zero cost.',
              },
              {
                n: '02',
                icon: '📝',
                title: 'Submit Predictions',
                body: 'Pick the exact scoreline for every Premier League match before kickoff. Predictions lock the moment the whistle blows — no late changes.',
              },
              {
                n: '03',
                icon: '🏆',
                title: 'Earn Points & Climb',
                body: 'Exact score = 3 pts. Correct result = 1 pt. Use your Double Up on one match each week — nail it and those points double!',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="bg-background border border-border rounded-2xl p-8 relative group hover:border-primary/60 transition-all hover:-translate-y-1"
              >
                <div className="absolute top-5 right-6 text-7xl font-black text-primary/5 leading-none">
                  {step.n}
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORING SYSTEM ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
          03 · The Engine
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4 font-heading">
          Scoring <span className="text-primary">System</span>
        </h2>
        <p className="text-textMuted text-lg mb-12 max-w-xl">
          Simple, fair, and rewarding for the bold. No complicated multipliers — just clean,
          transparent rules that keep players coming back week after week.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { pts: '3', label: 'Points', desc: 'Exact scoreline — e.g. you say 2-1, it ends 2-1', accent: false },
            { pts: '1', label: 'Point', desc: 'Correct result — right winner or draw, wrong score', accent: false },
            { pts: '0', label: 'Points', desc: 'Wrong result — back to the drawing board', accent: false },
            { pts: '⚡ 2×', label: 'Double Up', desc: 'Pick one match per week — get it right and your points for that match double!', accent: true },
          ].map((c) => (
            <div
              key={c.label}
              className={`rounded-2xl p-8 text-center border transition-all hover:-translate-y-0.5 ${
                c.accent
                  ? 'bg-amber-500/5 border-amber-500/40'
                  : 'bg-surface border-border hover:border-primary/60'
              }`}
            >
              <div
                className={`text-5xl font-black font-heading leading-none ${
                  c.accent ? 'text-amber-400' : 'text-primary'
                }`}
              >
                {c.pts}
              </div>
              <div
                className={`text-sm font-bold mt-2 mb-3 ${c.accent ? 'text-amber-400' : 'text-textMuted'}`}
              >
                {c.label}
              </div>
              <p className="text-textMuted text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM STATS / FEATURES ──────────────── */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
            04 · New for 2026/27
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-heading">
            New Season, <span className="text-primary">New Features</span>
          </h2>
          <p className="text-textMuted text-lg mb-12 max-w-2xl">
            PPW has evolved from international tournaments to the heart of the football calendar:
            domestic league football. We've kept our point-scoring mechanics perfectly consistent
            while introducing a suite of features engineered explicitly for virality, community
            competition, and user stickiness.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                emoji: '🏟️',
                title: 'Supporters Leagues',
                body: 'Allowing fans to band together and push their club\'s fan base to the top of a collective leaderboard. Pure community engagement.',
              },
              {
                emoji: '🎯',
                title: 'Bonus Point Sub-Games',
                body: 'Dynamic mid-week triggers keep users logging back into the platform outside traditional weekend match windows — extending the engagement loop.',
              },
              {
                emoji: '🎁',
                title: 'Tiered Prize Architecture',
                body: 'Regularized weekly, monthly, and seasonal milestones to incentivise continuous play, minimising drop-offs even if a player has a poor game week.',
              },
              {
                emoji: '📈',
                title: '100% Reinvestment Model',
                body: '100% of sponsorship fees are directly allocated to software optimisation and UX. All commercial profits are instantly re-injected into marketing to aggressively scale our active user base.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-background border border-border rounded-2xl p-8 hover:border-primary/40 transition-all"
              >
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIP TIERS ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
          05 · Partnership Tiers
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4 font-heading">
          Seasonal <span className="text-primary">Partnerships</span>
        </h2>
        <p className="text-textMuted text-lg mb-14 max-w-2xl">
          Dominant title partnerships with deep platform integration. Each tier is designed to give
          your brand genuine ownership of a key PPW experience — and to grow with our audience.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className={`rounded-2xl p-8 border relative group transition-all hover:-translate-y-1 ${
                tier.featured
                  ? 'border-primary bg-gradient-to-br from-primary/10 to-background'
                  : 'border-border bg-surface hover:border-primary/60'
              }`}
            >
              {tier.featured && (
                <div className="absolute top-4 right-[-12px] bg-primary text-black text-[9px] font-black tracking-widest uppercase px-4 py-0.5 rotate-45 translate-x-2">
                  Most Popular
                </div>
              )}
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
                {tier.name}
              </p>
              <h3 className="text-2xl font-black font-heading mb-1">{tier.title}</h3>
              <div className="text-3xl font-black text-primary font-heading mb-0.5">
                {tier.price}
              </div>
              <p className="text-xs text-textMuted mb-6">
                {tier.priceSub}
                {tier.monthly && <> · {tier.monthly}</>}
              </p>
              <div className="h-px bg-border mb-6" />
              <ul className="space-y-3">
                {tier.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-textMuted">
                    <span className="text-primary font-bold flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── A LA CARTE ─────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
            06 · Flexible Inventory
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 font-heading">
            À La Carte <span className="text-primary">Media</span>
          </h2>
          <p className="text-textMuted text-lg mb-12 max-w-xl">
            Agile, standalone digital media inventory for brands that want targeted exposure
            without a full-season commitment.
          </p>

          <div className="space-y-4">
            {aLaCarte.map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border rounded-2xl p-6 flex items-start gap-5 hover:border-primary/60 transition-all group"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base mb-1">{item.title}</h4>
                  <p className="text-textMuted text-sm leading-relaxed">{item.desc}</p>
                </div>
                <div className="text-2xl font-black text-primary font-heading flex-shrink-0">
                  {item.price}
                  {item.per && (
                    <span className="block text-xs font-normal text-textMuted font-sans">
                      {item.per}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEXT STEPS ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">
          07 · Let's Talk
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-8 font-heading">
          Next Steps &amp; <span className="text-primary">Custom Activations</span>
        </h2>
        <div className="space-y-5 text-textMuted text-lg leading-relaxed">
          <p>
            To preserve the elite user experience of PlayPredictWin and guarantee maximum return on
            investment for our commercial allies, we{' '}
            <strong className="text-text">strictly cap the number of primary partners</strong> we
            work with each season.
          </p>
          <p>
            We favour long-term collaboration, placing a high premium on brands that share our
            vision of scaling together. We are fully equipped to craft bespoke cross-channel
            activations, hybrid affiliate/revenue-share models, or prize-subsidy structures that
            align perfectly with your brand's specific acquisition targets.
          </p>
          <p>
            Contact us today to lock in your asset exclusivity for the 2026/27 campaign and scale
            your audience alongside ours. We look forward to working with you!
          </p>
        </div>

        <div className="mt-10 border-l-4 border-primary rounded-r-2xl bg-primary/5 px-8 py-7">
          <p className="text-text font-bold text-xl mb-3">📍 We're ready when you are.</p>
          <a
            href="mailto:partners@playpredictwin.com"
            className="text-primary font-bold text-xl hover:underline"
          >
            partners@playpredictwin.com
          </a>
          <p className="text-textMuted text-sm mt-3">Danny &amp; Steve — Founders, PlayPredictWin</p>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────── */}
      <section className="relative text-center py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,#1a3a2a_0%,#0f172a_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black font-heading mb-6">
            Ready to Scale<br />
            <span className="text-primary">With Us?</span>
          </h2>
          <p className="text-textMuted text-xl mb-12">
            The 2026/27 Premier League season kicks off on 15 August. Don't miss the most engaging
            prediction platform in football.
          </p>
          <a
            href="mailto:partners@playpredictwin.com"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-black font-extrabold text-xl px-14 py-5 rounded-full transition-all hover:-translate-y-1"
          >
            🏆 Lock In Your Partnership
          </a>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <div className="bg-surface border-t border-border py-12 text-center">
        <p className="text-2xl font-black font-heading mb-3">
          PLAY<span className="text-primary">PREDICT</span>WIN
        </p>
        <p className="text-textMuted text-sm">
          <a href="https://www.playpredictwin.com" className="text-primary hover:underline">
            www.playpredictwin.com
          </a>{' '}
          ·{' '}
          <a href="mailto:partners@playpredictwin.com" className="text-primary hover:underline">
            partners@playpredictwin.com
          </a>
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-textMuted hover:text-text text-sm transition-colors"
          >
            ← Back to PlayPredictWin
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}