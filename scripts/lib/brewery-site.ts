/**
 * Does a web page belong to a brewery? Used by check-brewery-websites and fetch-brewery-logos so a
 * stale or hijacked `website` doesn't put someone else's site (or logo) on a brewery's page.
 */

// Words too common in brewery names to identify one
const GENERIC = new Set([
  'brewing', 'brewery', 'breweries', 'brewers', 'brewhouse', 'brewpub', 'company', 'beer', 'beers', 'ales', 'ale',
  'the', 'and', 'farm', 'farms', 'craft', 'works', 'house', 'pub', 'tap', 'taproom', 'restaurant', 'kitchen',
  'cellars', 'project', 'grill', 'bar', 'fermentation', 'meadery', 'cidery', 'winery', 'distillery', 'maryland',
  'general', 'store', 'our', 'cultivated', 'street', 'upper', 'main', 'county',
]);

/** Words from a brewery name that could identify it, e.g. "Flying Dog Brewery" -> ["flying", "dog"]. */
function distinctiveWords(name: string): string[] {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC.has(w));
}

/** Page <title>, entity-decoded and trimmed. */
export function pageTitle(html: string): string {
  const raw = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '';
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&#x27;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#?[a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when the page's host or title mentions a distinctive word of the brewery's name.
 * Names made only of generic words (no distinctive word) can't be checked and pass.
 */
export function pageMatchesBrewery(breweryName: string, finalUrl: string, title: string): boolean {
  const words = distinctiveWords(breweryName);
  if (words.length === 0) return true;
  const host = new URL(finalUrl).hostname;
  const haystack = `${host.replace(/[.-]/g, ' ')} ${host.replace(/[.-]/g, '')} ${title}`.toLowerCase();
  return words.some((w) => haystack.includes(w));
}

// First path segments that are share buttons, tracking pixels or posts rather than a profile
const NOT_A_PROFILE: Record<string, RegExp> = {
  'facebook.com': /^(2008|tr|sharer|sharer\.php|share|plugins|pages|events|pg|dialog|profile\.php)$/i,
  'twitter.com': /^(intent|i|share|home|search)$/i,
  'x.com': /^(intent|i|share|home|search)$/i,
  'instagram.com': /^(p|explore|reel|reels|stories)$/i,
  'untappd.com': /^(v|w|b|user)$/i,
};
// Hosts where those segments are junk only on their own: untappd.com/w/<brewery>/<id> is a real page
const JUNK_ONLY_ALONE = new Set(['untappd.com']);

/**
 * True for scraped social links that aren't a profile: facebook.com/2008 (the SDK snippet),
 * facebook.com/tr (the pixel), share and intent links, single posts. profile.php counts only with an id.
 */
export function isJunkSocialUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return true;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0] ?? '';
  if (!first) return true;
  if (JUNK_ONLY_ALONE.has(host) && segments.length > 1) return false;
  if (host === 'facebook.com' && first === 'profile.php' && url.searchParams.get('id')) return false;
  return NOT_A_PROFILE[host]?.test(first) ?? false;
}
