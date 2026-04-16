import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Play Predict Win',
  description: 'Common questions about Play Predict Win — World Cup 2026 prediction league.',
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "When does the World Cup 2026 start?", "acceptedAnswer": { "@type": "Answer", "text": "The tournament kicks off on 11 June 2026 in the USA, Canada, and Mexico. The final is on 19 July 2026 in New Jersey." } },
      { "@type": "Question", "name": "How do points work?", "acceptedAnswer": { "@type": "Answer", "text": "You earn 3 points for every exact scoreline you predict correctly (e.g. you say 2-1, it ends 2-1). You earn 1 point for predicting the correct result but the wrong score (e.g. you say 2-1, it ends 3-1). Wrong results earn 0 points." } },
      { "@type": "Question", "name": "When can I submit predictions?", "acceptedAnswer": { "@type": "Answer", "text": "You can submit predictions at any time before kickoff of the relevant match. Once the match kicks off, your predictions for that match are locked and cannot be changed." } },
      { "@type": "Question", "name": "Is it free to play?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, creating an account and playing in the public league is free. Private leagues with custom rules may have a small subscription fee depending on the league settings." } },
      { "@type": "Question", "name": "Can I create a private league for me and my mates?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Head to the Leagues section after signing up to create a private league and invite friends via a unique link." } },
      { "@type": "Question", "name": "What happens if I miss a match?", "acceptedAnswer": { "@type": "Answer", "text": "You can still view the league and submit predictions for upcoming matches. Missed matches simply earn 0 points — no penalty for missing a game." } },
      { "@type": "Question", "name": "How is the leaderboard ranked?", "acceptedAnswer": { "@type": "Answer", "text": "By total points accumulated across all group and knockout matches. If there is a tie on points, the tiebreaker is whoever got the most exact scorelines." } },
      { "@type": "Question", "name": "Can I change my prediction after submitting?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — as long as the match hasn't kicked off. Go to the Fixtures page and edit your prediction before the deadline." } },
      { "@type": "Question", "name": "How do I delete my account?", "acceptedAnswer": { "@type": "Answer", "text": "Email privacy@playpredictwin.com with your account email address and we'll delete your data within 30 days in accordance with UK GDPR." } },
    ],
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="text-4xl font-black mb-2">FAQ</h1>
      <p className="text-textMuted mb-12">Everything you need to know about Play Predict Win.</p>

      <div className="space-y-8">
        {[
          {
            q: 'When does the World Cup 2026 start?',
            a: 'The tournament kicks off on 11 June 2026 in the USA, Canada, and Mexico. The final is on 19 July 2026 in New Jersey.',
          },
          {
            q: 'How do points work?',
            a: 'You earn 3 points for every exact scoreline you predict correctly (e.g. you say 2-1, it ends 2-1). You earn 1 point for predicting the correct result but the wrong score (e.g. you say 2-1, it ends 3-1). Wrong results earn 0 points.',
          },
          {
            q: 'When can I submit predictions?',
            a: 'You can submit predictions at any time before kickoff of the relevant match. Once the match kicks off, your predictions for that match are locked and cannot be changed.',
          },
          {
            q: 'Is it free to play?',
            a: 'Yes, creating an account and playing in the public league is free. Private leagues with custom rules may have a small subscription fee depending on the league settings.',
          },
          {
            q: 'Can I create a private league for me and my mates?',
            a: 'Yes. Head to the Leagues section after signing up to create a private league and invite friends via a unique link.',
          },
          {
            q: 'What happens if I miss a match?',
            a: 'You can still view the league and submit predictions for upcoming matches. Missed matches simply earn 0 points — no penalty for missing a game.',
          },
          {
            q: 'How is the leaderboard ranked?',
            a: 'By total points accumulated across all group and knockout matches. If there is a tie on points, the tiebreaker is whoever got the most exact scorelines.',
          },
          {
            q: 'Can I change my prediction after submitting?',
            a: 'Yes — as long as the match hasn\'t kicked off. Go to the Fixtures page and edit your prediction before the deadline.',
          },
          {
            q: 'How do I delete my account?',
            a: 'Email privacy@playpredictwin.com with your account email address and we\'ll delete your data within 30 days in accordance with UK GDPR.',
          },
        ].map(item => (
          <div key={item.q} className="border-b border-border pb-8">
            <h2 className="text-lg font-bold mb-2">{item.q}</h2>
            <p className="text-textMuted leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}