'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CLIENT, requestAd } from '@/lib/ads';
import { useAdsAllowed } from './useAdsAllowed';

const SLOT = process.env.NEXT_PUBLIC_ADSENSE_RAIL_SLOT?.trim();

/**
 * The brewery page's 300x250 unit (CLAUDE.md: one rail slot, reserved height, no ad-block
 * detection). Desktop only: the rail is a column from lg up, and on phones it would sit
 * mid-content. Renders nothing until NEXT_PUBLIC_ADSENSE_RAIL_SLOT names an AdSense unit.
 */
export default function RailAd() {
  const allowed = useAdsAllowed();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const show = Boolean(SLOT) && allowed && desktop;
  useEffect(() => {
    if (show) requestAd();
  }, [show]);

  if (!SLOT || !allowed) return null;
  // The space is reserved at lg+ from the first render; the unit itself mounts once we know it's desktop
  return (
    <aside
      aria-label="Advertisement"
      className="hidden min-h-[268px] flex-col items-center gap-1 lg:flex"
    >
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
        Advertisement
      </span>
      <div className="h-[250px] w-[300px]">
        {show && (
          <ins
            className="adsbygoogle"
            style={{ display: 'inline-block', width: 300, height: 250 }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={SLOT}
          />
        )}
      </div>
    </aside>
  );
}
