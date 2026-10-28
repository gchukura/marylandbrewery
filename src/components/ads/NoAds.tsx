'use client';

import { useEffect } from 'react';
import { suppressAds } from '@/lib/ads';

/** Rendered by error and 404 pages: no ads (and no AdSense script) while they're shown. */
export default function NoAds() {
  useEffect(() => suppressAds(), []);
  return null;
}
