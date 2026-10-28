'use client';

import { useEffect } from 'react';
import { loadAdSense } from '@/lib/ads';
import { useAdsAllowed } from './useAdsAllowed';

/** Quiet time after the load event before ads may start on their own */
const AFTER_LOAD_MS = 3000;
const IDLE_TIMEOUT_MS = 2000;

/**
 * Loads the AdSense script on pages with ads: at the visitor's first scroll, tap or key press, or
 * else in idle time a few seconds after the page has finished loading. AdSense brings ~250 KB of
 * script; starting it during hydration pushed mobile LCP past budget.
 */
export default function AdSenseLoader() {
  const allowed = useAdsAllowed();

  useEffect(() => {
    if (!allowed) return;
    let done = false;
    let timer: number | undefined;
    let idle: number | undefined;
    // Safari has no requestIdleCallback (the DOM types say it always exists)
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

    const load = () => {
      if (done) return;
      done = true;
      cleanup();
      loadAdSense();
    };
    const whenIdle = () => {
      idle = hasIdle
        ? window.requestIdleCallback(load, { timeout: IDLE_TIMEOUT_MS })
        : window.setTimeout(load, 0);
    };
    const afterLoad = () => {
      timer = window.setTimeout(whenIdle, AFTER_LOAD_MS);
    };

    events.forEach((e) =>
      window.addEventListener(e, load, { once: true, passive: true })
    );
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });

    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, load));
      window.removeEventListener('load', afterLoad);
      window.clearTimeout(timer);
      if (idle !== undefined) {
        if (hasIdle) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
    }
    return cleanup;
  }, [allowed]);

  return null;
}
