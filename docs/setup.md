# Setup

How to run marylandbrewery.com locally and connect it to its services.

## Requirements

- Node 22 (`.nvmrc`). With nvm: `nvm use`. Node 24 also installs cleanly, but Vercel builds on 22.
- npm (the lockfile is npm's; don't use pnpm or yarn).
- Access to the Supabase project (for the keys below).

## Install and run

```bash
npm ci
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

`.env.local` must be a plain-text file. One saved by TextEdit as rich text (RTF) looks fine but no variable in it is read, and the build fails with "Missing Supabase environment variables".

## Environment variables

Every variable is listed with a comment in `.env.example`. In short:

| Variable | Needed for | Where it's set |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything. The build prerenders pages from Supabase. | `.env.local`, Vercel (Production + Preview), GitHub Actions secrets (CI) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts that write data | `.env.local` only |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps on the site | `.env.local`, Vercel |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Map ID for the site's maps (advanced markers need one; without it maps show a placeholder). Google Cloud > Google Maps Platform > Map Management > Create Map ID, type JavaScript, Vector | `.env.local`, Vercel |
| `GOOGLE_MAPS_API_KEY` | Scripts that call Places/Geocoding: a separate server key ([below](#google-server-key)) | `.env.local` only |
| `ADMIN_SYNC_TOKEN` | `/api/sync`, `/api/revalidate` | `.env.local`, Vercel, GitHub Actions secret |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID` | Contact form | Vercel |
| `YELP_API_KEY` | `npm run data:reviews:yelp` | `.env.local` |

The GitHub Actions sync workflow also needs a repository **variable** `SITE_URL` (e.g. `https://marylandbrewery-rdni.vercel.app`, no trailing slash).

## Google server key

The site's `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is a **browser key**: it ships in the page, so it's restricted to the site's domains and Google refuses it from scripts. The data scripts use a second, **server key** in `GOOGLE_MAPS_API_KEY`. It never leaves `.env.local` (not Vercel, not GitHub).

In [Google Cloud Console](https://console.cloud.google.com/), in the **same project** as the browser key (the one with billing and the Places API already enabled):

1. **APIs & Services > Library:** make sure **Places API** and **Geocoding API** are enabled. The scripts use the classic Places web service (`maps.googleapis.com/maps/api/place/...`). Google no longer lets new projects enable it, which is why it has to be the existing project.
2. **APIs & Services > Credentials > Create credentials > API key.** Rename it "marylandbrewery scripts".
3. **Application restrictions: None.** Website restrictions are what break scripts; IP restrictions break whenever your home IP changes.
4. **API restrictions: Restrict key** to **Places API** and **Geocoding API** only. That limits the damage if the key ever leaks.
5. Add it to `.env.local` as `GOOGLE_MAPS_API_KEY=...` and run `npm run google:check`. Every line should be ✓.

Optionally set a daily quota cap (APIs & Services > Places API > Quotas). A full `data:check-websites` run with Google is about 150 Place Details calls.

## Supabase

Supabase Postgres is the only data store. Schema changes live in `supabase/migrations/`; `supabase/config.toml` holds the local CLI config.

To use the CLI against the hosted project (needed to apply migrations or generate types):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>   # the ref is in the project URL: https://<ref>.supabase.co
npx supabase db push                             # applies pending migrations
npm run db:types                                 # regenerate src/lib/db/database.types.ts
```

Regenerate the types after every migration; the clients in `src/lib/db/client.ts` are typed with them.

Before the first `db push`, check what the remote history already records with `npx supabase migration list`, and mark migrations that production already has as applied, e.g. `npx supabase migration repair --status applied 20240101000000`.

Review a migration before pushing it; it runs against production data.

## Checks before a PR

```bash
npm run typecheck   # app + live scripts
npm run lint
npm test            # Vitest unit tests
npm run build
npm run test:e2e    # Playwright smoke tests (builds and starts the app; first run: npx playwright install chromium)
```

CI (`.github/workflows/ci.yml`) runs typecheck, lint, test, build and the internal link check on every PR.

## Deploying

Vercel deploys `main` to production and every PR to a preview. Install command is `npm ci` (`vercel.json`). After changing data in Supabase, run **Actions → Sync site data** on GitHub to refresh every page immediately; otherwise pages refresh within an hour.

See also: [troubleshooting.md](troubleshooting.md), [scripts.md](scripts.md).
