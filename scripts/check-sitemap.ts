/**
 * Crawl every URL in the sitemap and report anything that isn't a clean, indexable page.
 *
 *   npm run seo:check                                 # http://localhost:3000 (run `npm start` first)
 *   npm run seo:check -- https://marylandbrewery-rdni.vercel.app
 *
 * Errors (exit code 1): a status other than 200, a redirect, a canonical that isn't the URL
 * itself, a noindex page, a title over 60 or a description over 155 characters.
 * Sitemap <loc>s use the production origin; they're fetched from the given base.
 */

const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;
const CONCURRENCY = 8;
const PRODUCTION_ORIGIN = 'https://www.marylandbrewery.com';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

interface Problem {
  path: string;
  issue: string;
}

async function checkPage(path: string): Promise<Problem[]> {
  const res = await fetch(base + path, { redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    return [{ path, issue: `redirects (${res.status}) to ${res.headers.get('location')}` }];
  }
  if (res.status !== 200) return [{ path, issue: `status ${res.status}` }];

  const html = await res.text();
  const problems: Problem[] = [];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]?.replace(PRODUCTION_ORIGIN, '') || '';
  const expected = path === '/' ? '' : path;
  if (canonical !== expected && !(path === '/' && canonical === '/')) {
    problems.push({ path, issue: `canonical is "${canonical || '(none)'}"` });
  }
  const robots = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  if (/noindex/i.test(robots)) problems.push({ path, issue: `robots "${robots}"` });
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  if (!title) problems.push({ path, issue: 'no <title>' });
  else if (title.length > MAX_TITLE) problems.push({ path, issue: `title ${title.length} chars: "${title}"` });
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (!description) problems.push({ path, issue: 'no meta description' });
  else if (description.length > MAX_DESCRIPTION) problems.push({ path, issue: `description ${description.length} chars` });
  return problems;
}

async function main() {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const duplicates = paths.length - new Set(paths).size;
  console.log(`Checking ${paths.length} sitemap URLs against ${base}`);

  const problems: Problem[] = [];
  if (duplicates > 0) problems.push({ path: '/sitemap.xml', issue: `${duplicates} duplicate URLs` });
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < paths.length) {
        const path = paths[next++];
        try {
          problems.push(...(await checkPage(path)));
        } catch (error) {
          problems.push({ path, issue: `fetch failed: ${error instanceof Error ? error.message : String(error)}` });
        }
      }
    })
  );

  for (const p of problems.sort((a, b) => a.path.localeCompare(b.path))) console.log(`  ${p.path}  ${p.issue}`);
  console.log(`\n${paths.length} URLs checked, ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
  process.exit(problems.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
