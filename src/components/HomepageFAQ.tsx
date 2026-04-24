'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Is it free to play?',
    a: 'Yes — creating an account and competing in leagues is completely free. Prizes are funded by our partners who you can find linked on the homepage.',
  },
  {
    q: 'When does the World Cup start?',
    a: 'The 2026 FIFA World Cup kicks off on 11 June 2026 in the USA, Canada, and Mexico. The final is on 19 July 2026 in New Jersey.',
  },
  {
    q: 'How do points work?',
    a: 'Predict the exact scoreline and earn 3 points. Predict the correct result (right winner or draw, wrong score) and earn 1 point. Get it wrong and you earn 0 points.',
  },
  {
    q: 'Can I create a private league with my mates?',
    a: 'Yes. Sign up for free, head to Leagues, and create a private league. Share your unique invite link with friends — whoever joins using your code is in.',
  },
  {
    q: 'Can I change my prediction after submitting?',
    a: 'Yes — as long as the match hasn\'t kicked off. Visit the Fixtures page and edit your prediction before the deadline.',
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};

export default function HomepageFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-border py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-2">Frequently Asked Questions</h2>
          <p className="text-textMuted">Everything you need to know about Play Predict Win</p>
        </div>

        <div className="space-y-2">
          {faqs.map((item, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface/50 transition-colors"
              >
                <span className="font-semibold text-sm">{item.q}</span>
                <span className={`text-primary text-lg shrink-0 transition-transform ${open === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-textMuted text-sm leading-relaxed border-t border-border pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/faq" className="text-primary text-sm font-medium hover:underline">
            View all questions →
          </a>
        </div>
      </div>
    </section>
  );
}
