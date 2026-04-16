'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Consent = {
  analytics: boolean;
  advertising: boolean;
  resolved: boolean;
};

type ConsentContextType = {
  consent: Consent;
  setConsent: (c: Consent) => void;
  showPrefs: boolean;
  setShowPrefs: (v: boolean) => void;
};

const ConsentContext = createContext<ConsentContextType>({
  consent: { analytics: false, advertising: false, resolved: false },
  setConsent: () => {},
  showPrefs: false,
  setShowPrefs: () => {},
});

export function useConsent() {
  return useContext(ConsentContext);
}

const STORAGE_KEY = 'ppw_consent';

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<Consent>({
    analytics: false,
    advertising: false,
    resolved: false,
  });
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsentState({ ...parsed, resolved: true });
      } catch {
        setConsentState({ analytics: false, advertising: false, resolved: true });
      }
    }
  }, []);

  const setConsent = (c: Consent) => {
    setConsentState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  };

  return (
    <ConsentContext.Provider value={{ consent, setConsent, showPrefs, setShowPrefs }}>
      {children}
    </ConsentContext.Provider>
  );
}