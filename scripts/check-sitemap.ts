/**
 * Crawl every URL in the sitemap and report anything that isn't a clean, indexable page; then
 * crawl the site from the homepage and report sitemap pages nothing links to (orphans).
 *
 *   npm run seo:check                                 # http://localhost:3000 (run `npm start` first)
 *   npm run seo:check -- https://marylandbrewery-rdni.vercel.app
 *   VERCEL_AUTOMATION_BYPASS_SECRET=... npm run seo:check -- https://<preview>.vercel.app
 *
 * Errors (exit code 1): a status other than 200, a redirect, a canonical that isn't the URL
 * itself, a noindex page, a title over 60 or a description over 155 characters, an orphan (a
 * sitemap page with no internal link from another page), or an internal link to a redirect or
 * to a page that doesn't load (4xx/5xx).
 * Sitemap <loc>s use the production origin; they're fetched from the given base.
 */

const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;
const CONCURRENCY = 8;
const MAX_CRAWL = 5000;
const PRODUCTION_ORIGIN = 'https://www.marylandbrewery.com';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const baseOrigin = new URL(base).origin;
// Vercel previews are behind Vercel Authentication
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const headers: Record<string, string> = bypass ? { 'x-vercel-protection-bypass': bypass } : {};

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

interface Problem {
  path: string;
  issue: string;
}

interface Fetched {
  status: number;
  location: string | null;
  html: string;
}

const cache = new Map<string, Promise<Fetched>>();

function fetchPage(path: string): Promise<Fetched> {
  let pending = cache.get(path);
  if (!pending) {
    pending = fetch(base + path, { redirect: 'manual', headers }).then(async (res) => ({
      status: res.status,
      location: res.headers.get('location'),
      html: res.status === 200 && (res.headers.get('content-type') ?? '').includes('text/html') ? await res.text() : '',
    }));
    cache.set(path, pending);
  }
  return pending;
}

/** Internal page links in a document, as paths without query or hash. */
function internalLinks(html: string): Set<string> {
  const paths = new Set<string>();
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"#]*)(?:#[^"]*)?"/g)) {
    if (!href) continue;
    let url: URL;
    try {
      url = new URL(decode(href), PRODUCTION_ORIGIN);
    } catch {
      continue;
    }
    if (url.origin !== PRODUCTION_ORIGIN && url.origin !== baseOrigin) continue;
    if (/^\/(_next|api)\//.test(url.pathname) || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) continue;
    paths.add(url.pathname.replace(/(.)\/$/, '$1'));
  }
  return paths;
}

async function checkPage(path: string): Promise<Problem[]> {
  const res = await fetchPage(path);
  if (res.status >= 300 && res.status < 400) {
    return [{ path, issue: `redirects (${res.status}) to ${res.location}` }];
  }
  if (res.status !== 200) return [{ path, issue: `status ${res.status}` }];

  const html = res.html;
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

async function pool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) await worker(items[next++]);
    })
  );
}

/**
 * Breadth-first crawl from the homepage over internal links. Returns, for every page reached,
 * the set of other pages linking to it, and links that point at redirects.
 */
async function crawl(): Promise<{ inbound: Map<string, Set<string>>; toRedirects: Problem[]; broken: Problem[]; crawled: number }> {
  const inbound = new Map<string, Set<string>>();
  const seen = new Set<string>(['/']);
  const toRedirects: Problem[] = [];
  const broken: Problem[] = [];
  let frontier = ['/'];
  while (frontier.length > 0 && seen.size < MAX_CRAWL) {
    const next: string[] = [];
    await pool(frontier, async (path) => {
      let res: Fetched;
      try {
        res = await fetchPage(path);
      } catch {
        return;
      }
      if (res.status >= 300 && res.status < 400) return;
      for (const target of internalLinks(res.html)) {
        if (target === path) continue;
        if (!inbound.has(target)) inbound.set(target, new Set());
        inbound.get(target)!.add(path);
        if (!seen.has(target) && seen.size < MAX_CRAWL) {
          seen.add(target);
          next.push(target);
        }
      }
    });
    frontier = next;
  }
  // Links whose target redirects (a wasted hop for crawlers and visitors) or doesn't load
  for (const [target, sources] of inbound) {
    const res = await fetchPage(target).catch(() => null);
    const from = `linked from ${sources.size} page(s), e.g. ${[...sources][0]}`;
    if (res && res.status >= 300 && res.status < 400) {
      toRedirects.push({ path: target, issue: `${from}, but redirects to ${res.location}` });
    } else if (!res || res.status >= 400) {
      broken.push({ path: target, issue: `${from}, but returns ${res ? res.status : 'no response'}` });
    }
  }
  if (process.env.LIST_UNLISTED) console.log([...seen].join('\n'));
  return { inbound, toRedirects, broken, crawled: seen.size };
}

async function main() {
  const sitemapRes = await fetch(`${base}/sitemap.xml`, { headers });
  if (!sitemapRes.ok) throw new Error(`${base}/sitemap.xml: HTTP ${sitemapRes.status}${sitemapRes.status === 401 || sitemapRes.status === 302 ? ' (protected preview? set VERCEL_AUTOMATION_BYPASS_SECRET)' : ''}`);
  const sitemap = await sitemapRes.text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const duplicates = paths.length - new Set(paths).size;
  console.log(`Checking ${paths.length} sitemap URLs against ${base}`);

  const problems: Problem[] = [];
  if (duplicates > 0) problems.push({ path: '/sitemap.xml', issue: `${duplicates} duplicate URLs` });
  await pool(paths, async (path) => {
    try {
      problems.push(...(await checkPage(path)));
    } catch (error) {
      problems.push({ path, issue: `fetch failed: ${error instanceof Error ? error.message : String(error)}` });
    }
  });

  console.log('Crawling internal links from the homepage');
  const { inbound, toRedirects, broken, crawled } = await crawl();
  const orphans = paths.filter((p) => p !== '/' && !(inbound.get(p)?.size));
  for (const path of orphans) problems.push({ path, issue: 'orphan: no internal link from another page' });
  problems.push(...toRedirects.map((p) => ({ ...p, issue: `link to a redirect: ${p.issue}` })));
  problems.push(...broken.map((p) => ({ ...p, issue: `broken link: ${p.issue}` })));

  for (const p of problems.sort((a, b) => a.path.localeCompare(b.path))) console.log(`  ${p.path}  ${p.issue}`);
  const linked = paths.filter((p) => p === '/' || inbound.get(p)?.size).length;
  console.log(`\nCrawled ${crawled} pages; ${linked} of ${paths.length} sitemap URLs have internal links in (${orphans.length} orphans, ${toRedirects.length} links to redirects, ${broken.length} broken links)`);
  console.log(`${paths.length} URLs checked, ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
  process.exit(problems.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
