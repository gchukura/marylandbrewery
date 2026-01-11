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
  const [isVisible, setIsVisible] = useState(false); // Start hidden
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndInitialize = () => {
      // Check if adsbygoogle script is available (not blocked)
      const adScriptLoaded = document.querySelector('script[src*="adsbygoogle.js"]') !== null;
      const hasAdScript = !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));
      
      // If script is loaded, initialize ad and mark as visible
      if (adScriptLoaded || hasAdScript) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsVisible(true);
        } catch (error) {
          console.error('AdSense error:', error);
          setIsVisible(false);
        }
      } else {
        // Script not loaded yet or blocked - check again after a delay
        // If still not loaded after 1 second, assume blocked
        setTimeout(() => {
          const stillNotLoaded = !document.querySelector('script[src*="adsbygoogle.js"]') && !window.adsbygoogle;
          if (stillNotLoaded) {
            setIsVisible(false);
          } else {
            // Script loaded during delay, initialize now
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setIsVisible(true);
            } catch (error) {
              console.error('AdSense error:', error);
              setIsVisible(false);
            }
          }
        }, 1000);
      }
    };

    // Initial check
    checkAndInitialize();
  }, []);

  // Check if ad is actually displayed after a delay
  useEffect(() => {
    if (!adRef.current || !isVisible) return;

    const checkAdDisplay = () => {
      const adElement = adRef.current?.querySelector('.adsbygoogle') as HTMLElement | null;
      if (!adElement) {
        setIsVisible(false);
        return;
      }

      // Check if ad element has actual content/height
      const height = adElement.offsetHeight;
      const hasContent = adElement.children.length > 0 || height > 60; // More than minHeight

      // If ad has no content and is at minimal height, likely blocked
      if (!hasContent && height <= 50) {
        setIsVisible(false);
      }
    };

    // Check after initial render delay (allow time for ad to load)
    const timeout1 = setTimeout(checkAdDisplay, 1500);
    // Check again after longer delay (in case ad loads slowly)
    const timeout2 = setTimeout(checkAdDisplay, 4000);

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
  }, [isVisible]);

  // Don't render anything if ad is not visible - this removes all space
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

