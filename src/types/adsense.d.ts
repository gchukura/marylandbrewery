/**
 * Google AdSense TypeScript declarations
 */

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>> & {
      loaded?: boolean;
      push?: (ad: Record<string, unknown>) => void;
    };
  }
}

export {};
