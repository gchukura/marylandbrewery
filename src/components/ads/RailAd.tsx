'use client';

import { useEffect } from 'react';

const SLOT = process.env.NEXT_PUBLIC_ADSENSE_RAIL_SLOT?.trim();

/**
 * The brewery page's 300x250 unit (CLAUDE.md: one rail slot, reserved height, no ad-block
 * detection). Renders nothing until NEXT_PUBLIC_ADSENSE_RAIL_SLOT names an AdSense unit.
 */
export default function RailAd() {
  useEffect(() => {
    if (!SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // The script isn't loaded (blocked, or still loading); the space stays reserved
    }
  }, []);

  if (!SLOT) return null;
  return (
    <aside
      aria-label="Advertisement"
      className="flex flex-col items-center gap-1"
    >
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
        Advertisement
      </span>
      <div className="h-[250px] w-[300px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: 300, height: 250 }}
          data-ad-client="ca-pub-4357894821158922"
          data-ad-slot={SLOT}
        />
      </div>
    </aside>
  );
}
