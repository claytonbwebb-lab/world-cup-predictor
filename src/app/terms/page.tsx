import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Play Predict Win',
  description: 'Terms and conditions for Play Predict Win — Premier League 2026/27 prediction league.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2">Terms & Conditions</h1>
          <p className="text-textMuted text-sm">Last updated: 15 August 2026</p>
        </div>

        <div className="space-y-8 text-textMuted leading-relaxed text-sm">

          <div>
            <h2 className="text-lg font-bold text-text mb-2">1. Who We Are</h2>
            <p>
              Play Predict Win ("we", "us", "our") operates the website{' '}
              <a href="https://www.playpredictwin.com" className="text-primary hover:underline">
                www.playpredictwin.com
              </a>{' '}
              and related services. We are a UK-based competition platform run by Bright Stack Labs.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">2. Eligibility</h2>
            <p>To participate in Play Predict Win you must:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Be aged 18 years or over at the time of entry</li>
              <li>Have a valid email address and an active account</li>
              <li>Submit predictions honestly under your own account</li>
            </ul>
            <p className="mt-2">
              We reserve the right to request proof of age before awarding any prize. If a winner is unable
              to provide satisfactory proof of age, the prize will not be awarded and an alternative winner
              will be selected.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">3. How the Competition Works</h2>
            <p>
              Play Predict Win is a free-to-enter football score prediction competition. Participants predict
              the exact result of matches before kick-off. Points are awarded as follows:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>3 points</strong> — for predicting the exact final score</li>
              <li><strong>1 point</strong> — for predicting the correct result (win, draw, or loss)</li>
              <li><strong>0 points</strong> — for incorrect predictions</li>
            </ul>
            <p className="mt-2">
              Predictions lock when the match kicks off. Once locked, predictions cannot be changed.
              In the event of a match being postponed or cancelled, our decisions on scoring will be final.
            </p>
            <p className="mt-2">
              <strong>Match results</strong> are based on the score at the end of normal playing time (90 minutes,
              plus stoppage time). For cup or tournament matches that go to extra time or a penalty shoot-out,
              only the 90-minute result is counted for the purposes of this competition.
            </p>
            <p className="mt-2">
              <strong>Leaderboard ranking.</strong> Where two or more participants have the same total points
              in any weekly, monthly, or season leaderboard, they are ranked first by the number of exact
              scores predicted, and second by the number of correct results predicted. Our decisions on all
              ranking matters are final.
            </p>
            <p className="mt-2">
              <strong>Weekly prize ties.</strong> In the unlikely event of a tie for a weekly prize, all
              tied participants will be contacted to take part in a tiebreaker process. The tiebreaker
              format may vary and will be communicated at the time. Our decisions on tiebreakers are final.
            </p>
            <p className="mt-2">
              <strong>Double Up.</strong> Once per gameweek, participants may nominate one match as their
              Double Up pick. Points earned from a correct Double Up prediction are doubled (3 points becomes
              6 for an exact score; 1 point becomes 2 for a correct result). The Double Up pick locks when
              the first match of that gameweek kicks off and cannot be changed thereafter.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">4. Prizes</h2>
            <p>
              Prizes are funded by our commercial partners and are awarded to participants with the highest
              total points at the end of the competition. Specific prize values, quantities, and eligibility
              criteria will be communicated to winners directly.
            </p>
            <p className="mt-2">
              Prizes are non-transferable, non-exchangeable, and have no cash value. We reserve the right to
              substitute a prize of equal or greater value if the original prize becomes unavailable for
              reasons outside our control.
            </p>
            <p className="mt-2">
              Winners will be required to provide valid identification and proof of age (18+) before a
              prize is released. Payments will be made by BACS to the bank account details provided by
              the winner. We aim to process payouts within 14 business days of verification.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">5. Account Rules</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>One account per person — duplicate accounts will be deleted</li>
              <li>Predictions must be submitted by the account holder only</li>
              <li>Attempts to manipulate scores, collude, or exploit bugs will result in disqualification</li>
              <li>We may suspend or close any account if these terms are breached</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">6. Privacy & Data</h2>
            <p>
              We collect and process your personal data in accordance with our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. This
              includes your email address, username, predictions, and any data provided during prize
              verification. We do not sell your data to third parties.
            </p>
            <p className="mt-2">
              For prize payouts, we may share your information with our banking partner for the purposes
              of processing a BACS transfer.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Play Predict Win and Bright Stack Labs accept no
              liability for any loss, damage, or disappointment arising from participation in this
              competition or receipt of any prize.
            </p>
            <p className="mt-2">
              We make reasonable efforts to ensure the accuracy of match data, scores, and standings,
              but these are provided in good faith. We are not responsible for errors in third-party
              data sources or disputes arising from clerical mistakes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">8. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Any material changes will be communicated
              via email to registered users and updated on this page. Continued participation after
              a change constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-text mb-2">10. Contact</h2>
            <p>
              For any questions about these terms, contact us at:{' '}
              <a href="mailto:terms@playpredictwin.com" className="text-primary hover:underline">
                terms@playpredictwin.com
              </a>
            </p>
          </div>

        </div>

        <div className="text-center mt-12">
          <a href="/" className="text-textMuted hover:text-text text-sm transition-colors">
            ← Back to home
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
