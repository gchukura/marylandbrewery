'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Footer AdSense Ad Component
 * 
 * Displays a responsive ad at the bottom of pages, above the footer.
 * Ad unit: MarylandBrewery: Leaderboard-Bottom
 * 
 * Automatically hides the ad container if no ad is displayed (e.g., ad blocker active)
 * 
 * @param onVisibilityChange - Optional callback when visibility changes (e.g., when ad is blocked)
 */
interface FooterAdProps {
  onVisibilityChange?: (isVisible: boolean) => void;
}

export default function FooterAd({ onVisibilityChange }: FooterAdProps) {
  const [isVisible, setIsVisible] = useState(true); // Start visible to allow ads to load
  const adRef = useRef<HTMLDivElement>(null);
  const onVisibilityChangeRef = useRef(onVisibilityChange);
  
  // Keep callback ref updated
  useEffect(() => {
    onVisibilityChangeRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
      setIsVisible(false);
      onVisibilityChangeRef.current?.(false);
    }
  }, []);

  // Check if ad is actually displayed after a delay
  // Only hide if we're CERTAIN the ad is blocked (don't be too aggressive)
  useEffect(() => {
    if (!adRef.current) return;

    const checkAdDisplay = () => {
      const adElement = adRef.current?.querySelector('.adsbygoogle') as HTMLElement | null;
      if (!adElement) {
        // If element doesn't exist yet, don't hide - script may still be loading
        return;
      }

      // Check if ad element has actual content/height
      const height = adElement.offsetHeight;
      const hasContent = adElement.children.length > 0;

      // Check if adsbygoogle script loaded
      const scriptLoaded = !!(window.adsbygoogle && Array.isArray(window.adsbygoogle));
      const adScriptElement = document.querySelector('script[src*="adsbygoogle.js"]');
      
      // Only hide if we're CERTAIN it's blocked:
      // 1. Script element not in DOM AND script object doesn't exist
      // 2. AND ad has no content/children
      // 3. AND ad height is minimal (<= 50px, which is our minHeight)
      // This ensures we only hide when ad blocker is actually preventing ads
      if (!scriptLoaded && !adScriptElement && !hasContent && height <= 50) {
        setIsVisible(false);
        onVisibilityChangeRef.current?.(false);
      } else if (hasContent || height > 60) {
        // Ad has loaded, ensure visible
        if (!isVisible) {
          setIsVisible(true);
          onVisibilityChangeRef.current?.(true);
        }
      }
      // Otherwise, keep it visible - even if ad hasn't loaded yet, it might still load
    };

    // Give plenty of time for lazy-loaded script and ad to load
    // Check after longer delays since script uses lazyOnload strategy
    const timeout1 = setTimeout(checkAdDisplay, 5000);
    const timeout2 = setTimeout(checkAdDisplay, 10000);

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

