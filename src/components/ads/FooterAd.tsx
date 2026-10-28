'use client';

import { useEffect } from 'react';
import { ADSENSE_CLIENT, requestAd } from '@/lib/ads';
import { useAdsAllowed } from './useAdsAllowed';

/**
 * The site-wide footer unit. Fixed height so nothing shifts when it fills (or stays empty when
 * blocked). Not shown on pages without ads.
 */
export default function FooterAd() {
  const allowed = useAdsAllowed();

  useEffect(() => {
    if (allowed) requestAd();
  }, [allowed]);

  if (!allowed) return null;
  return (
    <aside aria-label="Advertisement" className="border-t border-line bg-white">
      <div className="mx-auto flex h-[100px] max-w-[1240px] items-center justify-center px-4 md:h-[110px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', maxWidth: 728, height: 90 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot="5210563601"
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </aside>
  );
}
