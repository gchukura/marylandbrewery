'use client';

import Script from 'next/script';

/**
 * Google AdSense Script Component
 * 
 * This component loads the Google AdSense script for all pages.
 * The publisher ID is from ads.txt: pub-4357894821158922
 * 
 * Using strategy="lazyOnload" to prevent preload warnings and improve page load performance.
 */
export default function AdSenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4357894821158922"
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

