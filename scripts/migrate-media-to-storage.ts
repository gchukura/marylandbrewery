/**
 * Move brewery photos and logos from public/ to Supabase Storage (bucket brewery-media),
 * converted to WebP, and point the brewery rows at the Storage URLs.
 *
 *   npm run media:migrate                 # dry run: processes every image, uploads nothing
 *   npm run media:migrate -- --limit 2    # dry run for the first 2 breweries
 *   npm run media:migrate -- --apply      # upload and update rows (needs SUPABASE_SERVICE_ROLE_KEY
 *                                         # and the brewery-media bucket)
 *
 * Photos: max 1600px long edge, WebP q80 -> photos/<slug>/<n>.webp (n follows the row's order).
 * Logos: max 512px, WebP with alpha -> logos/<slug>.webp. Re-runs skip objects whose size matches.
 * A brewery's row is updated only after all of its images uploaded. public/ is not touched.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { getAdminClient, getSupabase } from '@/lib/db/client';
import { existingObjectSizes, logoPath, photoPath, processLogo, processPhoto, publicMediaUrl, uploadIfChanged } from './lib/media';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
if (apply && args.includes('--dry-run')) throw new Error('Pass --apply or --dry-run, not both');
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? Number(limitArg.split('=')[1] ?? args[args.indexOf(limitArg) + 1]) : Infinity;

const PUBLIC = join(process.cwd(), 'public');
const extension = (path: string) => path.split('.').pop()?.toLowerCase().replace('jpeg', 'jpg') ?? '';
const realExt = (format: string) => format.replace('jpeg', 'jpg');

interface Totals {
  files: number;
  bytesBefore: number;
  bytesAfter: number;
  uploaded: number;
  skipped: number;
  rowsUpdated: number;
  mislabeled: string[];
  logoWarnings: string[];
  failures: string[];
}

async function main() {
  const totals: Totals = { files: 0, bytesBefore: 0, bytesAfter: 0, uploaded: 0, skipped: 0, rowsUpdated: 0, mislabeled: [], logoWarnings: [], failures: [] };
  const reader = apply ? getAdminClient() : getSupabase();
  const { data: rows, error } = await reader.from('breweries').select('id, slug, logo, photos').order('slug');
  if (error) throw error;

  let existing = new Map<string, number>();
  if (apply) {
    const admin = getAdminClient();
    for (const folder of ['logos']) existing = new Map([...existing, ...(await existingObjectSizes(admin, folder))]);
  }

  const referenced = new Set<string>();
  let processedBreweries = 0;

  for (const row of rows) {
    if (processedBreweries >= limit) break;
    const photos = Array.isArray(row.photos) ? (row.photos as string[]) : [];
    const localPhotos = photos.filter((p) => p.startsWith('/photos/'));
    const localLogo = row.logo?.startsWith('/logos/') ? row.logo : null;
    if (localPhotos.length === 0 && !localLogo) continue;
    processedBreweries++;

    if (apply) {
      const admin = getAdminClient();
      existing = new Map([...existing, ...(await existingObjectSizes(admin, `photos/${row.slug}`))]);
    }

    const newPhotos: string[] = [];
    let ok = true;
    for (const [index, photo] of photos.entries()) {
      if (!photo.startsWith('/photos/')) {
        newPhotos.push(photo); // already remote
        continue;
      }
      referenced.add(photo);
      const objectPath = photoPath(row.slug, index + 1);
      try {
        const input = await readFile(join(PUBLIC, photo));
        const out = await processPhoto(input);
        totals.files++;
        totals.bytesBefore += input.length;
        totals.bytesAfter += out.buffer.length;
        if (realExt(out.sourceFormat) !== extension(photo)) totals.mislabeled.push(`${photo} is ${out.sourceFormat}`);
        if (apply) totals[await uploadIfChanged(getAdminClient(), objectPath, out.buffer, existing)]++;
        newPhotos.push(publicMediaUrl(objectPath));
      } catch (e) {
        ok = false;
        totals.failures.push(`${row.slug} ${photo}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    let newLogo = row.logo;
    if (localLogo) {
      referenced.add(localLogo);
      const objectPath = logoPath(row.slug);
      try {
        const input = await readFile(join(PUBLIC, localLogo));
        const out = await processLogo(input);
        totals.files++;
        totals.bytesBefore += input.length;
        totals.bytesAfter += out.buffer.length;
        if (realExt(out.sourceFormat) !== extension(localLogo)) totals.mislabeled.push(`${localLogo} is ${out.sourceFormat}`);
        if (apply) totals[await uploadIfChanged(getAdminClient(), objectPath, out.buffer, existing)]++;
        newLogo = publicMediaUrl(objectPath);
      } catch (e) {
        // An unreadable logo (e.g. a .ico favicon saved as .png) keeps its current path so the
        // brewery's photos still migrate; refetch it with npm run data:logos
        totals.logoWarnings.push(`${row.slug} ${localLogo}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (apply && ok) {
      const { error: updateError } = await getAdminClient().from('breweries').update({ photos: newPhotos, logo: newLogo }).eq('id', row.id);
      if (updateError) totals.failures.push(`${row.slug} row update: ${updateError.message}`);
      else totals.rowsUpdated++;
    }
  }

  const onDisk = [
    ...(await readdir(join(PUBLIC, 'photos'))).map((f) => `/photos/${f}`),
    ...(await readdir(join(PUBLIC, 'logos'))).map((f) => `/logos/${f}`),
  ];
  const orphans = Number.isFinite(limit) ? [] : onDisk.filter((f) => !referenced.has(f));
  const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;

  console.log(`\n${apply ? 'APPLIED' : 'DRY RUN (nothing uploaded or updated)'}`);
  console.log(`Breweries with local media: ${processedBreweries}`);
  console.log(`Files processed: ${totals.files}`);
  console.log(`Bytes: ${mb(totals.bytesBefore)} -> ${mb(totals.bytesAfter)} (${totals.bytesBefore ? Math.round((1 - totals.bytesAfter / totals.bytesBefore) * 100) : 0}% smaller)`);
  if (apply) console.log(`Uploaded: ${totals.uploaded}, already up to date: ${totals.skipped}, rows updated: ${totals.rowsUpdated}`);
  console.log(`Wrong extension (real format differs): ${totals.mislabeled.length}`);
  for (const m of totals.mislabeled) console.log(`  ${m}`);
  if (!Number.isFinite(limit)) console.log(`Files in public/ not referenced by any brewery (not migrated): ${orphans.length}`);
  for (const o of orphans.slice(0, 40)) console.log(`  ${o}`);
  console.log(`Logos left as they are (unreadable; refetch with npm run data:logos): ${totals.logoWarnings.length}`);
  for (const w of totals.logoWarnings) console.log(`  ${w}`);
  console.log(`Failures: ${totals.failures.length}`);
  for (const f of totals.failures) console.log(`  ${f}`);
  if (totals.failures.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
