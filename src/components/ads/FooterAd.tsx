'use client';

import { useEffect, useState } from 'react';
import { ADSENSE_CLIENT, requestAd } from '@/lib/ads';
import { useAdsAllowed } from './useAdsAllowed';

// Fixed-size units: responsive ones (data-ad-format) let AdSense resize and collapse their parents
// when unfilled (it writes height/min-height !important inline), which shifts the page
const SIZES = {
  phone: { width: 320, height: 100 },
  wide: { width: 728, height: 90 },
};

/**
 * The site-wide footer unit, in space reserved from the first render so nothing shifts when it
 * fills, stays unfilled or is blocked. Not shown on pages without ads.
 */
export default function FooterAd() {
  const allowed = useAdsAllowed();
  const [size, setSize] = useState<keyof typeof SIZES | null>(null);

  useEffect(() => {
    setSize(window.matchMedia('(min-width: 768px)').matches ? 'wide' : 'phone');
  }, []);

  useEffect(() => {
    if (allowed && size) requestAd();
  }, [allowed, size]);

  if (!allowed) return null;
  return (
    <aside aria-label="Advertisement" className="border-t border-line bg-white">
      <div className="mx-auto flex h-[116px] max-w-[1240px] items-center justify-center px-4 md:h-[106px]">
        {size && (
          <ins
            key={size}
            className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: SIZES[size].width,
              height: SIZES[size].height,
            }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot="5210563601"
          />
        )}
      </div>
    </aside>
  );
}
