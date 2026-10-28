'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { adsAllowedOn, adsSuppressed, subscribeAds } from '@/lib/ads';

/** Whether ads may show on the current page (path rules and error/404 suppression). */
export function useAdsAllowed(): boolean {
  const pathname = usePathname();
  const suppressed = useSyncExternalStore(
    subscribeAds,
    adsSuppressed,
    () => false
  );
  return adsAllowedOn(pathname) && !suppressed;
}
