# AdSense

Publisher ID: `ca-pub-4357894821158922`. `public/ads.txt` declares it:

```
google.com, pub-4357894821158922, DIRECT, f08c47fec0942fa0
```

## Current implementation

| File | What it does |
| --- | --- |
| `src/components/ads/AdSenseScript.tsx` | Loads `adsbygoogle.js` (included from `src/app/layout.tsx`). |
| `src/components/ads/FooterAd.tsx` | The site-wide footer unit, ad slot `5210563601`, responsive. Used by `src/components/home-v2/FooterV2.tsx`. |
| `src/components/ads/AdSenseAd.tsx` | Generic unit; takes an `adSlot` prop. |
| `src/types/adsense.d.ts` | `window.adsbygoogle` typing. |

`FooterAd` currently tries to detect ad blockers (timers and a `MutationObserver`) and hides itself when it thinks ads are blocked.

## Decided layout (CLAUDE.md, 2026-10-27)

- One footer unit site-wide, and one 300x250 slot in the brewery page's right rail.
- Reserved heights so nothing shifts when an ad fills.
- No ad-block detection.

The rebuild does this in Prompt 11 (`FooterAd` and a new `RailAd` with reserved min-heights, ad-block detection removed, the script loaded after interaction or idle and skipped on `/contact`, `/add-brewery`, `/saved` and error pages).

## Creating a new ad unit

In AdSense: **Ads → By ad unit → Display ads → New ad unit**, choose Responsive (or 300x250 for the rail), and copy the `data-ad-slot` value from the generated snippet into the component.
