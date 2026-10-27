# CLAUDE.md

Maryland brewery directory (marylandbrewery.com). Read this before changing anything.
The root README.md and the many root-level *.md notes are outdated; trust this file and the code.

## Stack (actual, not what the old README says)
- Next.js 15.5 App Router, React 19, TypeScript (`strict: true`).
- Tailwind CSS v4 via `@tailwindcss/postcss`. Theme lives in `@theme` in `src/app/globals.css`.
- Supabase Postgres is the only data store. Schema migrations in `supabase/migrations/`.
- npm (package-lock.json), Node 22 (`engines.node: 22.x`). Deployed on Vercel (`vercel.json`, region iad1).
- Google Maps via `@vis.gl/react-google-maps`. AdSense (`src/components/ads/`).
- Path alias `@/*` maps to `src/*`.

## Decisions (made 2026-10-27; do not revisit without asking)
- Supabase stays the source of truth. No Google Sheets data layer.
- Neighborhood pages are kept and rebuilt at `/neighborhoods/[slug]`, looked up by the
  `maryland_neighborhoods.slug` column, with data-driven content (breweries sorted by distance,
  nearby attractions). Noindex any neighborhood with no brewery within 3 miles.
- `/best-breweries/[city]` exists only for cities with 5+ breweries. County, region and `near/`
  variants 301 to their main pages.
- Images live in Supabase Storage (public bucket `brewery-media`), not in `public/`.
- No admin web UI. Data sync is triggered by a GitHub Action calling `/api/sync` with a secret.
- Ads: one footer unit site-wide, one 300x250 slot in the brewery page right rail.
  Reserved heights, no ad-block detection.
- No blog until posts exist.
- Visual design: `docs/design/` is the source of truth (`tokens.css`, `mark.svg`, `mark-mono.svg`,
  `artboards/`). Fraunces for display, Inter for UI. Flag palette:
  - ink `#141414`
  - flag gold `#EAAA00`: fills and "open now" only, always black text
  - flag red `#E03A3E`: bands and motifs only
  - deep red `#B3121B`: buttons, links
  - cream `#F5EFE0`, paper `#FFFDF7`
- Counts and brewery details in the artboards are illustrative; always compute from data.

## Current state (gaps between the code and the decisions above)
These describe the code as of 2026-10-27. Fix them in their own PRs, not incidentally.
- Data access lives in the root `lib/` (`brewery-data.ts`, `supabase-client.ts`, `supabase.ts`,
  `supabase-attractions.ts`), imported by relative path. `src/lib/db` does not exist yet.
  Some pages (`src/app/sitemap.ts`, `src/app/breweries/[slug]/page.tsx`) call Supabase directly.
- `src/app/api/contact/route.ts` still appends to a Google Sheet via `googleapis`.
  `lib/archived/google-sheets.ts` is the retired Sheets layer.
- No `/neighborhoods` route yet; neighborhood-like pages are under `/cities/near/[slug]` and `/near/[slug]`.
- `/best-breweries/near/[city]` and `/best-breweries/near/[city]-md` still exist.
- `src/app/admin/sync` (admin UI) and `src/app/blog` still exist.
- Fonts are Playfair Display + Source Sans 3 via `next/font/google` in `src/app/layout.tsx`;
  `globals.css` also names `'Source Sans 3'` directly. Design tokens from `docs/design/tokens.css`
  are not yet in `globals.css`.
- `tailwind.config.ts` exists but is not loaded (no `@config`).
- Images are still in `public/` (`logos/`, `photos/`, `cities/`, `counties/`, `regions/`).
- Shared helpers `src/lib/geo.ts`, `hours.ts`, `slug.ts`, `amenities.ts`, `seo/` do not exist yet;
  related logic is spread across `src/lib/*-utils.ts` and root `lib/`.
- About 190 `as any` casts remain in `src/` and `lib/`.
- No `typecheck` or `test` npm scripts yet (the tooling PR adds them). `lint` and `build` exist.

## Conventions
- Server components by default. `"use client"` only for interactive islands, kept small.
- All Supabase access goes through `src/lib/db` (after the data-layer PR).
  No direct `supabase.from()` calls in pages or components.
- No `as any` in new or touched code. No hex colors in className; use theme tokens.
- Shared helpers live in one place: `src/lib/geo.ts`, `hours.ts`, `slug.ts`, `amenities.ts`, `seo/`.
- One PR per task. Before opening a PR run: `npm run typecheck`, `npm run lint`, `npm test`,
  `npm run build` (once these scripts exist). Include in the PR description what changed,
  how it was verified, and anything left undone.
- Never commit secrets, `.env` files, or generated images into `public/`.

## Known traps
- `unstable_cache` JSON-serializes return values; never cache `Map` or `Set`.
- `next/font` exposes fonts only through CSS variables; never reference a font by its family name.
- Tailwind v4 ignores `tailwind.config.ts` unless `@config` is used; tokens go in `@theme` in `globals.css`.
