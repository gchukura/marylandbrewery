/**
 * Check every brewery's `website`: does it load, and does it still belong to that brewery?
 * Read-only. Prints the suspicious ones; --all prints every row, --json writes the full result
 * to scripts/output/brewery-websites.json.
 *
 *   npm run data:check-websites
 *
 * A site is flagged when it fails to load, redirects to another domain, looks parked or spammy,
 * or neither its domain nor its page title mentions a distinctive word from the brewery's name.
 * Flags are leads for a human to check, not verdicts.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { mkdir, writeFile } from 'fs/promises';
import { getAdminClient } from '@/lib/db/client';
import { isJunkSocialUrl, pageMatchesBrewery, pageTitle } from './lib/brewery-site';

const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const SPAM = /\b(slot|gacor|casino|togel|judi|poker|betting|sportsbook|viagra|cialis|porn|escort|loan)s?\b/i;
const PARKED = /domain (is )?for sale|buy this domain|this domain (may be|is) (for sale|parked)|hugedomains|sedo\.com|dan\.com|afternic|parked free|godaddy\.com\/domains/i;

interface Result {
  slug: string;
  name: string;
  website: string;
  status: number | null;
  finalUrl: string | null;
  title: string;
  flags: string[];
}

const registrable = (host: string) => host.replace(/^www\./, '').split('.').slice(-2).join('.');

async function check(b: { slug: string; name: string; website: string }): Promise<Result> {
  const result: Result = { ...b, status: null, finalUrl: null, title: '', flags: [] };
  const url = /^https?:\/\//i.test(b.website) ? b.website : `https://${b.website}`;
  let html = '';
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': USER_AGENT } });
    result.status = res.status;
    result.finalUrl = res.url;
    html = (await res.text()).slice(0, 300_000);
    if (res.status >= 400) result.flags.push(`HTTP ${res.status}`);
  } catch (error) {
    result.flags.push(`unreachable (${error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : String(error)})`);
    return result;
  }

  result.title = pageTitle(html).slice(0, 120);
  const fromHost = new URL(url).hostname;
  const toHost = new URL(result.finalUrl ?? url).hostname;
  if (registrable(fromHost) !== registrable(toHost)) result.flags.push(`redirects to ${toHost}`);
  if (SPAM.test(result.title) || SPAM.test(toHost)) result.flags.push('spam');
  if (PARKED.test(html)) result.flags.push('parked domain');

  if (!pageMatchesBrewery(b.name, result.finalUrl ?? url, result.title)) result.flags.push('name not in domain or title');
  return result;
}

async function main() {
  const showAll = process.argv.includes('--all');
  const writeJson = process.argv.includes('--json');
  const { data, error } = await getAdminClient().from('breweries').select('slug, name, website, social_media').order('slug');
  if (error) throw error;

  const breweries = data.flatMap((b) => (b.website?.trim() && b.name ? [{ slug: b.slug, name: b.name, website: b.website }] : []));
  console.log(`Checking ${breweries.length} websites (${data.length - breweries.length} breweries have none)\n`);

  const results: Result[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < breweries.length) results.push(await check(breweries[next++]));
    })
  );
  results.sort((a, b) => a.slug.localeCompare(b.slug));

  const flagged = results.filter((r) => r.flags.length > 0);
  for (const r of showAll ? results : flagged) {
    console.log(`${r.flags.length > 0 ? '⚠️ ' : '✓ '} ${r.name}  [${r.slug}]`);
    console.log(`    ${r.website}${r.finalUrl && r.finalUrl.replace(/\/$/, '') !== r.website.replace(/\/$/, '') ? ` -> ${r.finalUrl}` : ''}`);
    console.log(`    title: ${r.title || '(none)'}`);
    if (r.flags.length > 0) console.log(`    ${r.flags.join('; ')}`);
  }

  if (writeJson) {
    await mkdir('scripts/output', { recursive: true });
    await writeFile('scripts/output/brewery-websites.json', JSON.stringify(results, null, 2));
    console.log('\nWrote scripts/output/brewery-websites.json');
  }
  // Social links are checked offline: scraped share buttons and pixels aren't profiles
  const junkSocial = data.flatMap((b) =>
    Object.entries((b.social_media ?? {}) as Record<string, string>)
      .filter(([, url]) => url && isJunkSocialUrl(url))
      .map(([network, url]) => `${b.slug}: ${network} ${url}`)
  );
  if (junkSocial.length > 0) console.log(`\nSocial links that aren't profiles:\n  ${junkSocial.join('\n  ')}`);

  console.log(`\n${results.length} checked, ${flagged.length} flagged, ${junkSocial.length} junk social links`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
