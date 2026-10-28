/**
 * Check every brewery's hours against Google Places and record when they match.
 *
 *   npm run data:verify-hours                              # report only
 *   npm run data:verify-hours -- --apply                   # set hours_verified_at on the matches
 *   npm run data:verify-hours -- --apply --take-google=slug-a,slug-b
 *                                                         # also replace those breweries' hours with Google's
 *
 * Needs the server key (GOOGLE_MAPS_API_KEY; `npm run google:check`). Hours are compared by parsed
 * open times, so formatting differences don't count. A mismatch is a lead, not a verdict: Google
 * can be the stale one, so a person picks which breweries to --take-google. Breweries Google lists
 * as closed (temporarily or permanently) are reported and never marked verified.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminClient } from '@/lib/db/client';
import type { WeeklyHours } from '@/lib/hours';
import { explainGoogleStatus, googleServerKey } from './lib/google';
import { hoursDifferences, hoursFromWeekdayText } from './lib/hours-check';

const CONCURRENCY = 6;

interface PlaceDetails {
  status: string;
  error_message?: string;
  result?: {
    business_status?: string;
    opening_hours?: { weekday_text?: string[] };
  };
}

type Outcome =
  | { kind: 'match' }
  | { kind: 'mismatch'; google: WeeklyHours; lines: string[] }
  | { kind: 'note'; note: string };

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const take = new Set(
    (args.find((a) => a.startsWith('--take-google='))?.split('=')[1] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  if (take.size > 0 && !apply) throw new Error('--take-google needs --apply');

  const key = googleServerKey();
  const db = getAdminClient();
  const { data, error } = await db
    .from('breweries')
    .select('id, slug, name, hours, place_id')
    .order('slug');
  if (error) throw error;
  const unknown = [...take].filter(
    (slug) => !data.some((b) => b.slug === slug)
  );
  if (unknown.length > 0)
    throw new Error(
      `--take-google: no brewery with slug ${unknown.join(', ')}`
    );

  const withPlace = data.filter((b): b is typeof b & { place_id: string } =>
    Boolean(b.place_id)
  );
  const outcomes = new Map<string, Outcome>();
  let denied: string | null = null;
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < withPlace.length && !denied) {
        const b = withPlace[i++];
        const body = (await (
          await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${b.place_id}&fields=business_status,opening_hours&key=${key}`
          )
        ).json()) as PlaceDetails;
        if (body.status === 'REQUEST_DENIED') {
          denied = explainGoogleStatus(body.status, body.error_message);
          return;
        }
        if (body.status !== 'OK') {
          outcomes.set(b.slug, {
            kind: 'note',
            note: `Google ${explainGoogleStatus(body.status, body.error_message)}`,
          });
          continue;
        }
        const business = body.result?.business_status;
        if (business && business !== 'OPERATIONAL') {
          outcomes.set(b.slug, {
            kind: 'note',
            note: `Google says ${business}`,
          });
          continue;
        }
        const lines = body.result?.opening_hours?.weekday_text;
        if (!lines?.length) {
          outcomes.set(b.slug, { kind: 'note', note: 'Google lists no hours' });
          continue;
        }
        const google = hoursFromWeekdayText(lines);
        const diffs = hoursDifferences(b.hours as WeeklyHours | null, google);
        outcomes.set(
          b.slug,
          diffs.length === 0
            ? { kind: 'match' }
            : {
                kind: 'mismatch',
                google,
                lines: diffs.map(
                  (d) =>
                    `${d.day}: we have "${d.stored}", Google has "${d.google}"`
                ),
              }
        );
      }
    })
  );
  if (denied) throw new Error(`Google refused the key: ${denied}`);

  const matches = [...outcomes]
    .filter(([, o]) => o.kind === 'match')
    .map(([slug]) => slug);
  const mismatches = [...outcomes].filter(
    (e): e is [string, Extract<Outcome, { kind: 'mismatch' }>] =>
      e[1].kind === 'mismatch'
  );
  const notes = [...outcomes].filter(
    (e): e is [string, Extract<Outcome, { kind: 'note' }>] =>
      e[1].kind === 'note'
  );
  const noPlace = data.filter((b) => !b.place_id).map((b) => b.slug);

  for (const [slug, o] of mismatches)
    console.log(
      `\n${slug}${take.has(slug) ? "  (taking Google's)" : ''}\n  ${o.lines.join('\n  ')}`
    );
  if (notes.length)
    console.log(
      `\nNot checked:\n  ${notes.map(([slug, o]) => `${slug}: ${o.note}`).join('\n  ')}`
    );
  if (noPlace.length) console.log(`\nNo place_id: ${noPlace.join(', ')}`);
  console.log(
    `\n${matches.length} match, ${mismatches.length} differ, ${notes.length} not checked, ${noPlace.length} without a place_id (of ${data.length})`
  );

  const notMismatched = [...take].filter(
    (slug) => outcomes.get(slug)?.kind !== 'mismatch'
  );
  if (notMismatched.length > 0)
    throw new Error(
      `--take-google: these don't differ from Google: ${notMismatched.join(', ')}`
    );

  if (!apply) {
    console.log(
      "\nReport only. --apply marks the matches verified; add --take-google=<slugs> to replace hours with Google's."
    );
    return;
  }
  const now = new Date().toISOString();
  const ids = (slugs: string[]) =>
    data.filter((b) => slugs.includes(b.slug)).map((b) => b.id);
  if (matches.length > 0) {
    const { error: e } = await db
      .from('breweries')
      .update({ hours_verified_at: now })
      .in('id', ids(matches));
    if (e) throw e;
  }
  for (const [slug, o] of mismatches.filter(([slug]) => take.has(slug))) {
    const { error: e } = await db
      .from('breweries')
      .update({ hours: o.google, hours_verified_at: now })
      .in('id', ids([slug]));
    if (e) throw e;
  }
  console.log(
    `Marked ${matches.length + take.size} breweries verified (${take.size} with Google's hours).`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
