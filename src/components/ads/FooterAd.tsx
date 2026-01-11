'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Footer AdSense Ad Component
 * 
 * Displays a responsive ad at the bottom of pages, above the footer.
 * Ad unit: MarylandBrewery: Leaderboard-Bottom
 * 
 * Automatically hides the ad container if no ad is displayed (e.g., ad blocker active)
 */
export default function FooterAd() {
  const [isVisible, setIsVisible] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Check if ad is actually displayed after a delay
  useEffect(() => {
    if (!adRef.current) return;

    const checkAdDisplay = () => {
      const adElement = adRef.current?.querySelector('.adsbygoogle');
      if (!adElement) {
        setIsVisible(false);
        return;
      }

      // Check if ad element has actual content/height
      const computedStyle = window.getComputedStyle(adElement);
      const height = adElement.offsetHeight;
      const hasContent = adElement.children.length > 0 || height > 60; // More than minHeight

      // Also check if adsbygoogle script failed to load
      const scriptLoaded = !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));
      const adBlocked = !scriptLoaded || (!hasContent && height <= 50);

      if (adBlocked) {
        setIsVisible(false);
      }
    };

    // Check after initial render delay (allow time for ad to load)
    const timeout1 = setTimeout(checkAdDisplay, 2000);
    // Check again after longer delay (in case ad loads slowly)
    const timeout2 = setTimeout(checkAdDisplay, 5000);

    // Use MutationObserver to watch for ad content changes
    const observer = new MutationObserver(checkAdDisplay);
    if (adRef.current) {
      observer.observe(adRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      observer.disconnect();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div ref={adRef} className="w-full bg-white border-t border-gray-200">
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

