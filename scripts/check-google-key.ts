/**
 * Check GOOGLE_MAPS_API_KEY against every Google API the data scripts use. Read-only; a handful of
 * requests (a fraction of a cent).
 *
 *   npm run google:check
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminClient } from '@/lib/db/client';
import { googleServerKey } from './lib/google';

interface Check {
  api: string;
  usedBy: string;
  run: (key: string, placeId: string) => Promise<string | null>; // null = OK, else the problem
}

async function legacy(url: string): Promise<{ problem: string | null; body: Record<string, unknown> }> {
  const body = (await (await fetch(url)).json()) as Record<string, unknown>;
  const ok = body.status === 'OK' || body.status === 'ZERO_RESULTS';
  return { problem: ok ? null : `${body.status}${body.error_message ? `: ${body.error_message}` : ''}`, body };
}

let photoReference: string | undefined;

const CHECKS: Check[] = [
  {
    api: 'Places API: Place Details',
    usedBy: 'data:photos, data:reviews:google, data:attractions, data:enrich, data:check-websites',
    run: async (key, placeId) => {
      const { problem, body } = await legacy(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,business_status,photos&key=${key}`
      );
      photoReference = (body.result as { photos?: { photo_reference: string }[] } | undefined)?.photos?.[0]?.photo_reference;
      return problem;
    },
  },
  {
    api: 'Places API: Text Search',
    usedBy: 'data:photos, data:reviews:google, data:geocode, data:enrich',
    run: async (key) => (await legacy(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent('Union Craft Brewing Baltimore')}&key=${key}`)).problem,
  },
  {
    api: 'Places API: Nearby Search',
    usedBy: 'data:attractions',
    run: async (key) => (await legacy(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=39.2904,-76.6122&radius=500&type=museum&key=${key}`)).problem,
  },
  {
    api: 'Places API: Place Photo',
    usedBy: 'data:photos',
    run: async (key) => {
      if (!photoReference) return 'skipped (Place Details failed or returned no photo)';
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${photoReference}&key=${key}`);
      return res.ok && res.headers.get('content-type')?.startsWith('image/') ? null : `HTTP ${res.status}`;
    },
  },
  {
    api: 'Geocoding API',
    usedBy: 'data:geocode, data:verify-coordinates',
    run: async (key) => (await legacy(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent('1700 W 41st St, Baltimore, MD')}&key=${key}`)).problem,
  },
];

async function main() {
  const key = googleServerKey();
  const { data, error } = await getAdminClient().from('breweries').select('place_id').not('place_id', 'is', null).limit(1).single();
  if (error || !data.place_id) throw new Error(`Couldn't read a place_id from Supabase: ${error?.message}`);

  let failures = 0;
  for (const check of CHECKS) {
    const problem = await check.run(key, data.place_id).catch((e: unknown) => (e instanceof Error ? e.message : String(e)));
    if (problem && !problem.startsWith('skipped')) failures++;
    console.log(`${problem ? (problem.startsWith('skipped') ? '–' : '✗') : '✓'} ${check.api}${problem ? `\n    ${problem}` : ''}\n    used by ${check.usedBy}`);
  }

  if (failures > 0) {
    console.log(`\n${failures} failed. REQUEST_DENIED usually means the key's API restrictions leave that API out,`);
    console.log('or the key has a website (HTTP referrer) restriction. See docs/setup.md#google-server-key.');
    process.exit(1);
  }
  console.log('\nThe server key works for every API the scripts use.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
