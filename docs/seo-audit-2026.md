# SEO audit, merged (status as of 2026-10-27)

This file merges and replaces four root documents:

- `SEO_AUDIT_2026.md` (audit dated 2026-01-05, updated 2026-01-07), marked **[A]** below
- `SEO_AUDIT_REPORT.md` (audit dated 2025-01, updated 2026-01-07), marked **[R]**
- `AHREFS_FIXES_SUMMARY.md` (2025-11-18), marked **[F]**
- `NEIGHBORHOOD_ROUTES_RECOMMENDATION.md`, marked **[N]**

Findings from the Ahrefs crawl of 2026-01-07 are marked **[X]**. Baseline counts for that crawl are in [ahrefs-2026-01-summary.md](ahrefs-2026-01-summary.md) and are not repeated here. Findings marked **[V]** were not in any source document; they turned up while checking the others against the code.

Every status was checked against `src/` on `main` at merge commit 1cb8a93 (PR #16). The status claims in the source documents were not taken on trust. Where they disagreed with the code, the code wins.

Status values:

- **Done**: fixed in the code. Gives the PR number, or the commit when the fix went straight to main without a PR.
- **False**: the finding or its recommendation was wrong. The notes say why.
- **Open**: not fixed and not yet scheduled.
- **Planned**: scheduled but not done yet. Names the area of planned work.

Not listed because they are not SEO findings: #7 (`/api/sync` auth bypass) and #15 (sync GitHub Action).

## Indexing & sitemap

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | 404 pages, 4XX URLs in the sitemap, and pages linking to broken pages | X | Done (#11, #12, #13, #16) | #11 fixed 258 sitemap 404s: neighborhood slug parsing, the St. Mary's county name, and breweries with no city. #12 retired the `/best-breweries` variants. #13 moved neighborhood URLs. #16 made unknown `/near/[slug]` pages return a real 404. Row 26 lists one source of broken links that is still open. |
| 2 | City, county and other listings rendered empty when served from cache | V | Done (#10) | `unstable_cache` serialized the Maps (`byCity` and the rest) to empty objects on cache hits. |
| 3 | Non-canonical pages in the sitemap: `/near/*` pages had the homepage as their canonical | X | Done (#16) | They inherited the layout's `canonical: '/'`. #16 removed it, so `src/app/near/[slug]/page.tsx` now sets its own canonical. |
| 4 | Same URL listed twice in the sitemap (e.g. every `havre-de-grace` URL) | X | Open | Ahrefs called these "page in multiple sitemaps", but there is only one sitemap: the same URL appears twice in it. Cause: `src/lib/db/brewery-data.ts` dedupes city names case-sensitively (`citySet.add(brewery.city)`), so "Havre de Grace" and "Havre De Grace" both survive, and `slugify` turns both into the same URL. The city×amenity loop in `sitemap.ts` repeats the problem. |
| 5 | Old neighborhood URLs (`/cities/near/{n}-{city}-md`, `/best-breweries/{n}-{city}-md`) were indexable but not in the sitemap, and the [N] proposal to add more routes in that pattern | X, N | Done (#13) | Built differently from [N]: neighborhoods now live at `/neighborhoods/[slug]`, and the old patterns 308-redirect there. Pages with no brewery within 3 miles are `noindex`, and the sitemap lists only the indexable ones. |
| 6 | Static pages not in the sitemap: `/faq`, `/our-story`, `/terms`, `/privacy-policy`, `/add-brewery`, `/become-featured`, `/customer-reviews`, `/marketing-tips`, `/photo-credits`, `/review-guidelines`, and the `/region` index | X | Open | `src/app/sitemap.ts` still lists only map, best-breweries, open-now, contact, and the cities/counties/amenities/type indexes. |
| 7 | Only 4 hard-coded `/near/[slug]` attraction pages are in the sitemap, though every attraction has a page | V | Planned (prompt 4) | The comment in `sitemap.ts` says prompt 4 replaces the hard-coded list with the full attractions table. |
| 8 | Sitemap `lastModified` is the build time for every URL except brewery pages | V | Planned (sitemap lastModified from data) | `const lastMod = new Date()` in `sitemap.ts`. |
| 9 | Thin city×amenity pages (1–2 breweries) are indexable and in the sitemap | V | Planned (city×amenity noindex under 3 breweries) | The sitemap includes any combination with at least one brewery. |
| 10 | Test, admin, placeholder and blog routes were publicly reachable | R, X | Done (#14, #16) | #14 removed `/admin` and `/blog`. #16 removed `/breweries/[slug]/test` and `/homepage-v2`. |
| 11 | Not Found branches of `generateMetadata` were indexable | V | Done (#16) | They now return `robots: { index: false, follow: false }`. |
| 12 | No custom 404 or error page | A | Done (commit 3223246, no PR) | `src/app/not-found.tsx` and `src/app/error.tsx` exist. |
| 13 | `robots.txt` blocked `/_next/static` and `/_next/image` | A | Done (commit 3223246, no PR) | `src/app/robots.ts` now disallows only `/api` and `/_next/webpack-hmr`. |
| 14 | Google Search Console verification not configured | A | Open | The `verification` block in `src/app/layout.tsx` is still commented out. If the site was verified by DNS instead, this can be closed. Sitemap submission is not confirmed either. |
| 15 | Bing Webmaster Tools verification and sitemap submission | A | Open | Nothing in the code, and nothing to show it was done outside the code. |

## Canonicals & redirects

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 16 | Every page inherited the root layout's `canonical: '/'` | V | Done (#16) | [R] reported "canonical URLs on all pages" as done, but pages without their own canonical were declaring the homepage as their canonical. |
| 17 | Missing canonicals on the map, open-now, open/[day], contact, cities and counties index pages | R | Done (Jan 2026 direct commits, no PR) | All of these pages now set `alternates.canonical`. |
| 18 | Brewery page canonical repeats the URL parameter | V | Open | `src/app/breweries/[slug]/page.tsx` finds a brewery by slug or by id, then sets `canonical: /breweries/${slug}` from the URL parameter. So `/breweries/{id}` renders and declares itself canonical. It should use the brewery's real slug, or redirect to it. |
| 19 | `/cities/near/[slug]/breweries` is a live duplicate route | V, X | Open | Nothing links to it and it is not in the sitemap. It renders for any 1–2 word slug, and the `-md` form declares itself canonical (`/cities/near/annapolis-md/breweries`). 4 of the 24 slow pages Ahrefs found were under `/cities/near/`. Redirect it to the city page or remove it. |
| 20 | Dead `cities/[city]-md` and `counties/[county]-md` route folders (the county one is `force-dynamic`) | A, V | Planned (delete the `-md` dead folders) | Both point their canonical at the version without `-md`, and neither is in the sitemap. |
| 21 | `/best-breweries` pages for small cities, counties, regions, `near/` and `-md` variants | X | Done (#12) | `/best-breweries/[city]` now exists only for cities with 5+ breweries. The other variants 308-redirect to the main page (`src/lib/best-breweries.ts`). |
| 22 | Internal links to `/city`, `/county` and `/breweries` that redirect | A, R, F, X | Done (commits 3223246 and df1f9ad, no PR) | No such links remain in `src/`. A link-validation workflow (`.github/workflows/link-validation.yml`) is on main. |
| 23 | Legacy redirects were temporary (302) | F | Done (commit df1f9ad, no PR) | Every rule in `next.config.ts` is permanent except `/blog`, which is temporary on purpose. |
| 24 | Mixed `www` and non-`www` URLs in canonicals and JSON-LD | F | Done (commit df1f9ad, no PR) | All absolute URLs in `src/` use `https://www.marylandbrewery.com`. The bare domain appears only as display text in the OG image components. |
| 25 | Double-slash URLs `/cities//{amenity}` (8 URLs, 576 links, also 8 of the 10 broken redirects) | X | Done (commit 8da242e, no PR) | City pages no longer build city×amenity links with an empty city. A `/cities//:amenity` redirect was also added. Untested: whether that redirect runs before Next.js's own slash normalization, which Ahrefs saw sending these URLs to `/cities/{amenity}`. |
| 26 | Brewery "Visit our Website" link uses the raw `brewery.website` value | V, X | Open | `SimpleBreweryPageTemplate.tsx` writes `href={brewery.website}`. A value without a protocol becomes a relative link: `www.libcobeer.com/` produced `/breweries/www.libcobeer.com/` → 404. This caused the other 2 of the 10 broken redirects. `BreweryCard.tsx` already adds `https://`; the template should too. |
| 27 | Host redirects: bare domain to `www` is a 307 (temporary), and `http://` on the bare domain hops through `https://` on the bare domain first | X | Open | This is set in the Vercel domain settings, not in `src/`. It should be a single permanent hop to `https://www`. |

## Metadata

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 28 | Titles too long and meta descriptions too long | X | Planned (`buildMetadata` helper, title ≤60 / description ≤155) | Example: `generateBreweryTitle` adds `" \| MD"`, and the layout template then adds `" \| Maryland Brewery Directory"` on top. |
| 29 | Type and amenity meta descriptions too short | R | Done, overcorrected (Jan 2026 direct commit, no PR) | They are now about 200+ characters, which is too long. The fix is covered by row 28. |
| 30 | Pages missing meta descriptions (home, map, open-now, open/[day], contact, index pages) | R | Done (Jan 2026 direct commits, no PR) | All of them now export metadata with a description. |
| 31 | Incomplete Open Graph and Twitter card tags | R | Done (Jan 2026 direct commits, no PR) | Dynamic pages set OG and Twitter tags. `createPageMetadata` covers the static pages. |
| 32 | Missing `og-image.jpg` | A | Done (commit 2282d8a, no PR) | Replaced by the generated `src/app/opengraph-image.tsx` and `twitter-image.tsx`, used by every page (`buildMetadata`). |
| 33 | Layout `openGraph.url` is the homepage, so pages without their own OG URL don't match their canonical | X | Planned (layout openGraph.url) | Still `url: "https://www.marylandbrewery.com"` in `src/app/layout.tsx`. |
| 34 | PWA manifest only had small icon sizes | A | Done (commit 2989fba, no PR) | `public/manifest.json` has 192×192 and 512×512 icons marked `any maskable`. |

## Structured data

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 35 | "Add `aggregateRating` to brewery JSON-LD" | A, R | False | The rating and count are Google Places data, not reviews collected on this site. Google's review-snippet rules do not allow ratings taken from other sites, and since 2019 a LocalBusiness's ratings of itself on its own page get no stars anyway. The markup was added anyway; row 36 removes it. |
| 36 | Remove `aggregateRating` from `SimpleBreweryPageTemplate.tsx` and `layout-utils.ts` | V | Planned (JSON-LD rework) | |
| 37 | Structured data fails Google rich-results validation | X | Planned (JSON-LD rework: Brewery + BreadcrumbList + CollectionPage) | Problems seen in the code: brewery `url` points to the brewery's own website instead of our page, and `ItemList` entries are typed `Brewery` with only a name and URL. |
| 38 | Add `BreadcrumbList` to more page types | A | Planned (JSON-LD rework) | No page emits a BreadcrumbList today. `generateBreadcrumbStructuredData` in `src/lib/layout-utils.ts` is never called. |
| 39 | Add `openingHoursSpecification` to brewery JSON-LD | A | Done (Jan 2026 direct commit, no PR) | Present in `SimpleBreweryPageTemplate.tsx`. |
| 40 | Add `WebSite` schema with a `SearchAction` for the sitelinks search box | A | False | Google retired the sitelinks search box in November 2024, before this audit was written. The schema is in `layout.tsx` and does no harm, but the `SearchAction` gains nothing. |
| 41 | Add FAQ schema to popular pages | A | False | Since August 2023, Google shows FAQ rich results only for well-known government and health sites, so this site would not get them. |
| 42 | Add `LocalBusiness` schema and `GeoCircle` "near me" targeting to city pages | A | False | A city listing is not a business, so LocalBusiness markup on it would be misleading. Per-brewery markup plus `CollectionPage` (row 37) is the right model. |

## Performance

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 43 | A global `Cache-Control: no-store` header disabled CDN caching | V | Done (#16) | Security headers are now set only in `next.config.ts`, and `vercel.json` has none. |
| 44 | Slow pages | X, F | Done (#13) | 20 of the 24 were old `/best-breweries/{neighborhood}-{city}-md` URLs, which now redirect. The other 4 are under `/cities/near/` (row 19). Re-measure in launch QA. [F]'s claim that "no code changes [are] needed" was wrong: the no-store header (row 43) was in place at the time. |
| 45 | Brewery images served from third-party hosts | V | Planned (images to Supabase Storage) | |
| 46 | Unused SEO packages (`next-seo`, `schema-dts`) in `package.json` | R | Done (prompt 2 PR, chore/tooling-ci) | Both removed with the unused programmatic templates. `next-sitemap` was already gone. |

## Content & linking

| # | Finding | Source | Status | Notes |
| --- | --- | --- | --- | --- |
| 47 | Indexable orphan pages (no internal links in) | X | Planned (internal linking / orphans) | For example, nothing in `src/` links to a `/cities/[city]/[amenity]` page. They are reachable only through the sitemap. |
| 48 | Missing alt text (14 pages) | X | Done (commit 8da242e, no PR) | The shared hero image (`/cities-hero.jpg`) had an empty alt. `PageHero.tsx` now falls back to `"{h1} - Maryland Brewery Directory"`. No `<img>` or `<Image>` in `src/` is missing `alt`. |
| 49 | Social icon alt text lacked the brewery name | R | Done (Jan 2026 direct commit, no PR) | Now `"{brewery.name} on Facebook"` and so on. |
| 50 | Keyword and featured-snippet opportunities: a "how many breweries in Maryland" stat, a dog-friendly landing page, a brewery tours guide, more county content | A | Open | Ideas only, never started. They may be folded into the redesign. |
