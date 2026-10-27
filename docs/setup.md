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
| `GOOGLE_MAPS_API_KEY` | Scripts that call Places/Geocoding | `.env.local` |
| `ADMIN_SYNC_TOKEN` | `/api/sync`, `/api/revalidate` | `.env.local`, Vercel, GitHub Actions secret |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEET_ID` | Contact form | Vercel |
| `YELP_API_KEY` | `npm run data:reviews:yelp` | `.env.local` |

The GitHub Actions sync workflow also needs a repository **variable** `SITE_URL` (e.g. `https://marylandbrewery-rdni.vercel.app`, no trailing slash).

## Supabase

Supabase Postgres is the only data store. Schema changes live in `supabase/migrations/`; `supabase/config.toml` holds the local CLI config.

To use the CLI against the hosted project (needed to apply migrations or generate types):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>   # the ref is in the project URL: https://<ref>.supabase.co
npx supabase db push                             # applies pending migrations
```

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
