'use client';

import { useConsent, type Consent } from './ConsentContext';

export default function ConsentBanner() {
  const { consent, setConsent, showPrefs, setShowPrefs } = useConsent();

  if (consent.resolved) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-end justify-center px-4 pb-4 sm:pb-6">
      <div className="w-full max-w-2xl bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-5 sm:p-6">
        {!showPrefs ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-relaxed">
                We use cookies to improve your experience and analyse site traffic.
                See our <a href="/privacy" className="text-green-400 hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setConsent({ analytics: true, advertising: true, resolved: true })}
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                Accept All
              </button>
              <button
                onClick={() => setConsent({ analytics: false, advertising: false, resolved: true })}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Cookie Preferences</h3>
              <button onClick={() => setShowPrefs(false)} className="text-white/40 hover:text-white text-lg leading-none cursor-pointer">×</button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-white">Analytics</span>
                  <p className="text-xs text-white/50 mt-0.5">Google Analytics — helps us understand site usage</p>
                </div>
                <input
                  type="checkbox"
                  className="accent-green-500 w-4 h-4"
                  defaultChecked={false}
                  onChange={e => {
                    const updated: Consent = { ...consent, analytics: e.target.checked };
                    setConsent(updated);
                  }}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-white">Advertising</span>
                  <p className="text-xs text-white/50 mt-0.5">Meta Pixel — helps us measure and improve ads</p>
                </div>
                <input
                  type="checkbox"
                  className="accent-green-500 w-4 h-4"
                  defaultChecked={false}
                  onChange={e => {
                    const updated: Consent = { ...consent, advertising: e.target.checked };
                    setConsent(updated);
                  }}
                />
              </label>
            </div>
            <button
              onClick={() => {
                const updated: Consent = {
                  analytics: (document.querySelectorAll('input[type=checkbox]')[0] as HTMLInputElement).checked,
                  advertising: (document.querySelectorAll('input[type=checkbox]')[1] as HTMLInputElement).checked,
                  resolved: true,
                };
                setConsent(updated);
              }}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}