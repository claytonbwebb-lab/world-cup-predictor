import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Play Predict Win',
  description: 'Privacy policy for Play Predict Win — FIFA World Cup 2026 prediction league.',
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-textMuted leading-relaxed">
        <p><strong className="text-text">Last updated: 16 April 2026</strong></p>

        <p>
          Play Predict Win ("we", "us", "our") operates the website{' '}
          <a href="https://www.playpredictwin.com" className="text-primary hover:underline">
            www.playpredictwin.com
          </a>{' '}
          and related services. We are committed to protecting your personal data and being
          transparent about how we collect, use, and share information about you.
        </p>

        <h2 className="text-xl font-bold text-text mt-8">1. Who We Are</h2>
        <p>
          We are Bright Stack Labs, a UK-based software company. If you have any questions
          about this policy or how we handle your data, contact us at:{' '}
          <strong>privacy@playpredictwin.com</strong>
        </p>

        <h2 className="text-xl font-bold text-text mt-8">2. What We Collect</h2>
        <p>We collect the following when you sign up and use our service:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account information:</strong> name, email address, and password (hashed).</li>
          <li><strong>Predictions data:</strong> the match scores you submit through our platform.</li>
          <li><strong>Usage data:</strong> pages visited, session duration, and general interaction data.</li>
          <li><strong>Payment information:</strong> handled by Stripe — we do not store card details.</li>
        </ul>

        <h2 className="text-xl font-bold text-text mt-8">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To create and maintain your account and predictions.</li>
          <li>To calculate and display leaderboard scores and rankings.</li>
          <li>To send service-related emails (account confirmation, match reminders, results).</li>
          <li>To analyse site usage via Google Analytics and Meta Pixel to improve our service.</li>
          <li>To process payments via Stripe.</li>
        </ul>

        <h2 className="text-xl font-bold text-text mt-8">4. Legal Basis (UK GDPR)</h2>
        <p>We process your data under the following lawful bases:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contract:</strong> to deliver the service you have signed up for.</li>
          <li><strong>Legitimate interests:</strong> to analyse and improve our platform, and prevent fraud.</li>
          <li><strong>Consent:</strong> for optional marketing communications (you can opt out at any time).</li>
        </ul>

        <h2 className="text-xl font-bold text-text mt-8">5. Sharing Your Data</h2>
        <p>We do not sell your personal data. We may share it with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> — our database provider, under their data processing agreement.</li>
          <li><strong>Stripe</strong> — for payment processing, under their privacy policy.</li>
          <li><strong>Google Analytics & Meta</strong> — for site analytics and conversion tracking.</li>
          <li>Law enforcement or regulators if legally required.</li>
        </ul>

        <h2 className="text-xl font-bold text-text mt-8">6. Data Retention</h2>
        <p>
          We keep your account data for the duration of your subscription and for 12 months
          after account closure. Prediction data may be retained longer for historical
          leaderboard records.
        </p>

        <h2 className="text-xl font-bold text-text mt-8">7. Your Rights (UK GDPR)</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access a copy of your personal data.</li>
          <li>Correct any inaccurate data.</li>
          <li>Request deletion of your data ("right to be forgotten").</li>
          <li>Object to or restrict certain processing.</li>
          <li>Data portability where applicable.</li>
        </ul>
        <p>
          To exercise any rights, email <strong>privacy@playpredictwin.com</strong>. We will
          respond within 30 days.
        </p>

        <h2 className="text-xl font-bold text-text mt-8">8. Cookies</h2>
        <p>
          We use cookies for session management and analytics. You can manage cookie preferences
          through your browser. Essential cookies cannot be disabled as they are required for
          the service to function.
        </p>

        <h2 className="text-xl font-bold text-text mt-8">9. Data Security</h2>
        <p>
          We use industry-standard encryption (HTTPS/TLS), secure cloud infrastructure, and
          role-based access controls to protect your data.
        </p>

        <h2 className="text-xl font-bold text-text mt-8">10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Any material changes will be notified
          via email to the address registered to your account.
        </p>
      </div>
    </div>
  );
}