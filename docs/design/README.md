# Design handoff — Maryland Brewery redesign

Source of truth: the "MarylandBrewery.com Redesign" design canvas (claude.ai). These files are a static export for implementation.

- `tokens.css` — Tailwind v4 `@theme` block with the palette, fonts, radii and type scale.
- `mark.svg` — full-color logo: pint glass on a black roundel, gold beer, white foam, Maryland flag as the label. Use at 32px and up.
- `mark-mono.svg` — single-color outline pint with a checker band; uses `currentColor`. Use for bullets, feature icons and anywhere one ink is required.
- `artboards/*.html` — the five artboards as markup (brand sheet, phone home, desktop home, city listing, brewery detail). Read them for structure, spacing and copy. They will not render standalone: they expect the canvas runtime (`support.js`), and image `src="/_blob/..."` URLs only resolve on the canvas. Inline styles map directly to the tokens above.

Notes:
- Counts in the mockups (152 breweries, 23 counties, region totals, "61 open") are illustrative. Compute them from data.
- Brewery descriptions, beer rows and reviews in brackets are placeholders for database fields.
- Photo/brewery pairings in the mockups are illustrative.
