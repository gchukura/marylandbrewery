/**
 * Google AdSense TypeScript declarations
 */

declare global {
  interface Window {
    adsbygoogle?: {
      loaded: boolean;
      push: (adConfig: Record<string, never>) => void;
    }[];
  }
}

export {};
