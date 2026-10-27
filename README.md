# Maryland Brewery Directory

[marylandbrewery.com](https://www.marylandbrewery.com) lists every craft brewery in Maryland, with pages for each brewery, city, county, region, neighborhood, amenity and brewery type, a statewide map, and "open now" listings. Brewery data lives in Supabase; pages are statically generated and refreshed hourly or on demand.

## Stack

- Next.js 15.5 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4
- Supabase Postgres (the only data store), accessed through `src/lib/db`
- Google Maps via `@vis.gl/react-google-maps`
- Deployed on Vercel; npm; Node 22
- Vitest (unit), Playwright (smoke), ESLint 9, GitHub Actions CI

## Quick start

```bash
nvm use                      # Node 22
npm ci
cp .env.example .env.local   # fill in the Supabase keys at minimum
npm run dev
```

## Common commands

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` | TypeScript for the app and live scripts |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run test:e2e` | Smoke tests against a production build |
| `npm run data:*` | Data scripts (reviews, photos, geocoding, …); see docs/scripts.md |

## Docs

- [CLAUDE.md](CLAUDE.md): project decisions, conventions and known traps. Read first.
- [docs/setup.md](docs/setup.md): environment variables, Supabase, running locally, deploying
- [docs/scripts.md](docs/scripts.md): every data script, its env vars and when to run it
- [docs/troubleshooting.md](docs/troubleshooting.md): build, deploy and Google Maps problems
- [docs/seo-audit-2026.md](docs/seo-audit-2026.md): SEO findings and their status
- [docs/adsense.md](docs/adsense.md): ad setup
- [docs/design/](docs/design/): the redesign handoff (tokens, logo, artboards)
