'use client';

import { useEffect } from 'react';

/**
 * Footer AdSense Ad Component
 * 
 * Displays a responsive ad at the bottom of pages, above the footer.
 * Ad unit: MarylandBrewery: Leaderboard-Bottom
 */
export default function FooterAd() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-1">
        <div className="flex justify-center items-center">
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '728px',
              minHeight: '50px',
            }}
            data-ad-client="ca-pub-4357894821158922"
            data-ad-slot="5210563601"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}

