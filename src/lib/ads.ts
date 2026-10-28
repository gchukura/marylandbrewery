/**
 * AdSense: one footer unit site-wide and one 300x250 in the brewery rail (CLAUDE.md). The script
 * loads after the page is idle or the visitor interacts, and never on pages without ads. No
 * ad-block detection: a blocked ad just leaves its reserved space empty.
 */
export const ADSENSE_CLIENT = 'ca-pub-4357894821158922';
const SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/** Pages that never show ads: forms, personal pages. Error and 404 pages opt out with suppressAds(). */
const NO_AD_PATHS = ['/contact', '/add-brewery', '/saved'];

export function adsAllowedOn(pathname: string | null): boolean {
  if (!pathname) return false;
  return !NO_AD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

// Error and not-found pages render inside the layout, which can't tell them from normal pages
let suppressed = 0;
const listeners = new Set<() => void>();

/** Hide ads while the calling page is mounted; returns the undo. */
export function suppressAds(): () => void {
  suppressed++;
  listeners.forEach((l) => l());
  return () => {
    suppressed--;
    listeners.forEach((l) => l());
  };
}

export const adsSuppressed = () => suppressed > 0;

export function subscribeAds(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Add the AdSense script once. Ad units queued with adsbygoogle.push() before it loads still render. */
export function loadAdSense() {
  if (
    typeof document === 'undefined' ||
    document.getElementById('adsbygoogle-js')
  )
    return;
  const script = document.createElement('script');
  script.id = 'adsbygoogle-js';
  script.async = true;
  script.src = SCRIPT_SRC;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

/** Queue an ad unit to fill (safe before the script loads). */
export function requestAd() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // The slot stays empty; its space is reserved either way
  }
}
