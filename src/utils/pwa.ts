// src/utils/pwa.ts

export function isIOS() {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  // For iOS, checks if it's launched from the home screen
  // For Android, this might not be reliable, but the prompt handles most cases
  return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone === true;
}
