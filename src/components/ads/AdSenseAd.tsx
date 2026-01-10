'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AdSenseAdProps {
  /**
   * Ad slot ID from Google AdSense (e.g., "1234567890")
   * You'll get this when you create an ad unit in AdSense
   */
  adSlot: string;
  /**
   * Ad format: "auto" for responsive, or specific dimensions like "728x90", "300x250"
   * Default: "auto" (responsive)
   */
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /**
   * Full width responsive ad (recommended for bottom of page)
   */
  fullWidthResponsive?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Google AdSense Ad Unit Component
 * 
 * Displays a Google AdSense advertisement.
 * Make sure you've created an ad unit in Google AdSense and have the ad slot ID.
 * 
 * Example usage:
 * <AdSenseAd adSlot="1234567890" format="auto" />
 */
export default function AdSenseAd({
  adSlot,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
}: AdSenseAdProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle && !window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
        }}
        data-ad-client="ca-pub-4357894821158922"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

