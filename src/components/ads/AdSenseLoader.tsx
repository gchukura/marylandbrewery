'use client';

import { useEffect } from 'react';
import { loadAdSense } from '@/lib/ads';
import { useAdsAllowed } from './useAdsAllowed';

const IDLE_TIMEOUT_MS = 4000;

/** Loads the AdSense script when the browser is idle or on first interaction, on pages with ads. */
export default function AdSenseLoader() {
  const allowed = useAdsAllowed();

  useEffect(() => {
    if (!allowed) return;
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      loadAdSense();
      cleanup();
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) =>
      window.addEventListener(e, load, { once: true, passive: true })
    );
    // Safari has no requestIdleCallback (the DOM types say it always exists)
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const idle = hasIdle
      ? window.requestIdleCallback(load, { timeout: IDLE_TIMEOUT_MS })
      : window.setTimeout(load, IDLE_TIMEOUT_MS);
    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, load));
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    }
    return cleanup;
  }, [allowed]);

  return null;
}
