type GtagCommand = 'event' | 'config' | 'js' | 'set';

type GtagParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: GtagCommand, target: string | Date, params?: GtagParams) => void;
  }
}

export function trackGaEvent(eventName: string, params?: GtagParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
