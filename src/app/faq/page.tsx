import type { Metadata } from 'next';
import Link from 'next/link';
import NavBar from "@/components/NavBar";;
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FAQ | Play Predict Win',
  description: 'Common questions about Play Predict Win — Premier League 2026/27 prediction league.',
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "When does the Premier League 2026/27 season start?", "acceptedAnswer": { "@type": "Answer", "text": "The 2026/27 Premier League season kicks off on 15 August 2026. The final gameweek is scheduled for May 2027." } },
      { "@type": "Question", "name": "How do points work?", "acceptedAnswer": { "@type": "Answer", "text": "You earn 3 points for every exact scoreline you predict correctly (e.g. you say 2-1, it ends 2-1). You earn 1 point for predicting the correct result but the wrong score (e.g. you say 2-1, it ends 3-1). Wrong results earn 0 points." } },
      { "@type": "Question", "name": "What is Double Up?", "acceptedAnswer": { "@type": "Answer", "text": "Once per week you can nominate one match as your Double Up pick. The points you earn from that match are doubled — so an exact score becomes 6 points instead of 3, and a correct result becomes 2 points instead of 1." } },
      { "@type": "Question", "name": "How do I use Double Up?", "acceptedAnswer": { "@type": "Answer", "text": "On the Dashboard, select a match you've already predicted. You can change your pick at any time before the first match of that gameweek kicks off." } },
      { "@type": "Question", "name": "When does my Double Up pick lock?", "acceptedAnswer": { "@type": "Answer", "text": "Your pick locks as soon as the first match of that gameweek kicks off. After that, you cannot change it for that week." } },
      { "@type": "Question", "name": "What if I don't make a Double Up pick?", "acceptedAnswer": { "@type": "Answer", "text": "No problem — you just earn normal points for all your predictions. Double Up is optional." } },
      { "@type": "Question", "name": "What is the Supporter League?", "acceptedAnswer": { "@type": "Answer", "text": "A club-vs-club competition where every point you earn also counts towards your chosen club's total. All the points from fans of each club are added together and the clubs are ranked — so you help your club win just by playing." } },
      { "@type": "Question", "name": "How do I pick my club?", "acceptedAnswer": { "@type": "Answer", "text": "Select your favourite club when you sign up, or change it anytime from your account settings." } },
      { "@type": "Question", "name": "Do my points automatically count towards my club?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — as soon as your predictions are scored, your points are added to your club's Supporter League total. No extra steps needed." } },
      { "@type": "Question", "name": "Does Double Up count double for my club too?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — if your Double Up pick is correct, the doubled points also count double towards your club's total." } },
      { "@type": "Question", "name": "When can I submit predictions?", "acceptedAnswer": { "@type": "Answer", "text": "You can submit predictions at any time before kickoff of the relevant match. Once the match kicks off, your predictions for that match are locked and cannot be changed." } },
      { "@type": "Question", "name": "Is it free to play?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — creating an account and competing in leagues is completely free." } },
      { "@type": "Question", "name": "Can I create a private league for me and my mates?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Head to the Leagues section after signing up to create a private league and invite friends via a unique link." } },
      { "@type": "Question", "name": "What happens if I miss a match?", "acceptedAnswer": { "@type": "Answer", "text": "You can still view the league and submit predictions for upcoming matches. Missed matches simply earn 0 points — no penalty for missing a game." } },
      { "@type": "Question", "name": "How is the leaderboard ranked?", "acceptedAnswer": { "@type": "Answer", "text": "By total points accumulated across all Premier League matches. If there is a tie on points, the tiebreaker is whoever got the most exact scorelines, and if still tied, whoever got the most correct results." } },
      { "@type": "Question", "name": "Can I change my prediction after submitting?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — as long as the match hasn't kicked off. Go to the Fixtures page and edit your prediction before the deadline." } },
      { "@type": "Question", "name": "How do I delete my account?", "acceptedAnswer": { "@type": "Answer", "text": "Email privacy@playpredictwin.com with your account email address and we'll delete your data within 30 days in accordance with UK GDPR." } },
    ],
  };

  return (
    <>
      <NavBar />
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
              q: 'When does the Premier League 2026/27 season start?',
              a: 'The 2026/27 Premier League season kicks off on 15 August 2026. The final gameweek is scheduled for May 2027.',
            },
            {
              q: 'How do points work?',
              a: 'You earn 3 points for every exact scoreline you predict correctly (e.g. you say 2-1, it ends 2-1). You earn 1 point for predicting the correct result but the wrong score (e.g. you say 2-1, it ends 3-1). Wrong results earn 0 points.',
            },
            {
              q: 'What is Double Up?',
              a: 'Once per week you can nominate one match as your Double Up pick. The points you earn from that match are doubled — so an exact score becomes 6 points instead of 3, and a correct result becomes 2 points instead of 1.',
            },
            {
              q: 'How do I use Double Up?',
              a: "On the Dashboard, select a match you've already predicted. You can change your pick at any time before the first match of that gameweek kicks off.",
            },
            {
              q: 'When does my Double Up pick lock?',
              a: 'Your pick locks as soon as the first match of that gameweek kicks off. After that, you cannot change it for that week.',
            },
            {
              q: 'What if I don\'t make a Double Up pick?',
              a: 'No problem — you just earn normal points for all your predictions. Double Up is optional.',
            },
            {
              q: 'What is the Supporter League?',
              a: 'A club-vs-club competition where every point you earn also counts towards your chosen club\'s total. All the points from fans of each club are added together and the clubs are ranked — so you help your club win just by playing.',
            },
            {
              q: 'How do I pick my club?',
              a: 'Select your favourite club when you sign up, or change it anytime from your account settings.',
            },
            {
              q: 'Do my points automatically count towards my club?',
              a: 'Yes — as soon as your predictions are scored, your points are added to your club\'s Supporter League total. No extra steps needed.',
            },
            {
              q: 'Does Double Up count double for my club too?',
              a: 'Yes — if your Double Up pick is correct, the doubled points also count double towards your club\'s total.',
            },
            {
              q: 'When can I submit predictions?',
              a: 'You can submit predictions at any time before kickoff of the relevant match. Once the match kicks off, your predictions for that match are locked and cannot be changed.',
            },
            {
              q: 'Is it free to play?',
              a: 'Yes — creating an account and competing in leagues is completely free.',
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
              a: 'By total points accumulated across all Premier League matches. If there is a tie on points, the tiebreaker is whoever got the most exact scorelines, and if still tied, whoever got the most correct results.',
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

        {/* Back to site */}
        <div className="text-center pb-12">
          <Link href="/" className="text-primary text-sm font-medium hover:underline">
            ← Back to site
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}