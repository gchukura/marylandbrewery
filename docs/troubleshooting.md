# Troubleshooting

Known problems with building, testing, deploying and running the site, organized by symptom. Each entry gives the cause and the fix.

Stack reference: Next.js 15.5 (App Router), npm, Node 22 (`.nvmrc`, `engines.node` in `package.json`), Tailwind v4 via `@tailwindcss/postcss`, Google Maps via `@vis.gl/react-google-maps`, data in Supabase, deployed on Vercel with `installCommand: npm ci` (`vercel.json`).

## Build fails with "Missing Supabase environment variables" or "Failed to collect page data for /amenities/[amenity]"

**Cause.** `NEXT_PUBLIC_SUPABASE_URL` and/or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set where the build runs. Pages are generated at build time from Supabase, and `src/lib/db/client.ts` throws when either variable is missing. The first route to hit the client during page-data collection (often `/amenities/[amenity]`) is the one named in the error.

**Fix.** Set both variables in every place a build runs:

- Locally: in `.env.local` in the project root.
- Vercel: in the project's Environment Variables, enabled for both Production and Preview. Redeploy after adding them.
- GitHub Actions CI: as repository secrets with the same names (`.github/workflows/ci.yml` reads `secrets.NEXT_PUBLIC_SUPABASE_URL` and `secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY`).

If the variables are present in `.env.local` but the build still reports them missing, check that the file is plain text. A `.env.local` saved by TextEdit in rich-text (RTF) format is not parsed. Recreate it as plain text (in TextEdit: Format > Make Plain Text, or write it with a code editor), then rebuild. `head -c 20 .env.local` should show your first variable, not `{\rtf1`.

## Build fails inside next/font with "Cannot read properties of null (reading '1')"

**Cause.** `src/app/layout.tsx` loads Playfair Display and Source Sans 3 through `next/font/google`, which downloads the fonts during the build. When that download fails transiently, next/font fails with this unhelpful error.

**Fix.** Rerun the build (locally, or redeploy / rerun the CI job). No code change is needed.

## Vercel emails "Production deployment failed" for a project that is not the active one

**Cause.** An old Vercel project is still connected to the GitHub repository, so every push builds it too. It has no environment variables, so its builds fail (typically with the Supabase error above).

**Fix.** In the old project's settings, disconnect its Git integration, or delete the project. Do not add env vars to it; only the active project should build.

## `npm ci` warns about skipped install scripts (esbuild, sharp, unrs-resolver)

**Cause.** Running `npm ci` with Node 24 / npm 11, which reports that dependency install scripts were not run.

**Fix.** None needed; the warning is harmless here. The project targets Node 22 (`.nvmrc`), and Vercel and CI build with Node 22. Use `nvm use` to match if you want a clean local install.

## Playwright fails with "Executable doesn't exist"

**Cause.** Playwright was upgraded and the browser build it expects has not been downloaded yet.

**Fix.** Run:

```bash
npx playwright install chromium
```

Then rerun `npm run test:e2e`.

## Map shows "Map is unavailable: missing Google Maps API key"

**Cause.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` was empty when the app was built. The map components (`src/components/maps/GoogleMap.tsx` and the `*MapClient.tsx` files) render this message instead of the map. `NEXT_PUBLIC_` variables are inlined into the client bundle at build time, so setting the key afterwards has no effect until the next build.

**Fix.**

- Locally: add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...` to `.env.local` (one line, no quotes or spaces around the value) and restart `npm run dev`.
- Vercel: add the variable for Production and Preview, then redeploy.

`GoogleMap.tsx` logs `[GoogleMap] API Key loaded: AIza...` or `[GoogleMap] API Key missing!` to the browser console, which shows whether the key reached the client bundle.

## Map fails to load in the browser (AuthFailure or a "...MapError" in the console)

**Cause.** The key reached the page but Google rejected it. In most cases the key's restrictions do not allow the current site. Check the browser console for the specific error:

| Console error | Cause | Fix |
| --- | --- | --- |
| `RefererNotAllowedMapError` | The page's origin is not in the key's HTTP referrer list | Add the referrers below |
| `ApiNotActivatedMapError` | Maps JavaScript API is not enabled for the project | Enable it |
| `InvalidKeyMapError` | Wrong, truncated or malformed key | Recopy the key (starts with `AIza`, about 39 characters, no spaces or quotes), and confirm it belongs to the right Google Cloud project |
| `BillingNotEnabledMapError` | No billing account linked | Link billing |

**Fix.** In [Google Cloud Console](https://console.cloud.google.com/) for the project that owns the key:

1. APIs & Services > Library: enable **Maps JavaScript API**.
2. Billing: link a billing account. It is required even when usage stays within the monthly free credit.
3. APIs & Services > Credentials > the browser key:
   - Application restrictions: **HTTP referrers (web sites)**, with these entries:
     ```
     localhost:3000/*
     *.vercel.app/*
     https://www.marylandbrewery.com/*
     https://marylandbrewery.com/*
     ```
     Include both the `www` and non-`www` domain.
   - API restrictions: restrict to **Maps JavaScript API**.
4. Save, wait 1 to 2 minutes for the change to propagate, then reload in a private window or after a hard refresh.

To tell restrictions apart from a bad key, temporarily set Application restrictions to "None". If the map then loads, the referrer list is the problem. Restore the restriction afterwards. APIs & Services > Dashboard shows per-API errors and quota usage for the key.

## Data scripts fail with "API keys with referer restrictions cannot be used with this API"

**Cause.** The Google data scripts (`npm run data:reviews:google`, `data:photos`, `data:geocode`, `data:verify-coordinates`, and others that call Google) run in Node and send no HTTP referrer, so a key restricted to HTTP referrers is refused. These scripts use the legacy Places API web service (Text Search, Nearby Search, Place Details, Place Photo) and the Geocoding API.

The scripts read `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` first and fall back to `GOOGLE_MAPS_API_KEY` only when the public key is unset. Because `.env.local` normally contains the referrer-restricted public key, adding `GOOGLE_MAPS_API_KEY` to `.env.local` alone does not change which key the scripts use.

**Fix.** Use a separate server-side key rather than loosening the browser key:

1. Google Cloud Console > APIs & Services > Credentials > Create credentials > API key. Name it, for example, "Server-side scripts".
2. Application restrictions: **None** (or IP addresses, if you run the scripts from a fixed IP).
3. API restrictions: restrict to **Places API** and **Geocoding API**. Enable both under APIs & Services > Library if they are not already.
4. Pass the key to the script so it takes precedence over `.env.local` (dotenv does not override variables already set in the shell):
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<server key> npm run data:reviews:google
   ```

Do not remove the referrer restriction from the browser key to make scripts work; that key is public in the client bundle.

## Locally, a page loads without styles or the console shows a stylesheet 404 after `npm start`

**Cause.** A stale `.next` directory from an earlier build. The HTML references CSS file hashes that the current build no longer produces.

**Fix.** Rebuild from a clean `.next` and hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R):

```bash
npm run build:clean   # rm -rf .next && next build
npm start
# or both in one step:
npm run start:clean
```

This applies only to local production builds; Vercel builds from a clean checkout.
