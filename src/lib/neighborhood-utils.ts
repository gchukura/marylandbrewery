import { cache } from 'react';
import { getAllNeighborhoods } from '@/lib/db';
import { legacyNeighborhoodSlug } from '@/lib/neighborhoods';

/**
 * Every neighborhood slug, and old "{neighborhood}-{city}-md" slug -> neighborhood slug. Exact
 * matches only. Built once per request (a Map can't go in unstable_cache).
 */
const neighborhoodSlugs = cache(async () => {
  const slugs = new Set<string>();
  const legacy = new Map<string, string>();
  for (const n of await getAllNeighborhoods()) {
    slugs.add(n.slug);
    const old = legacyNeighborhoodSlug(n);
    if (old) legacy.set(old, n.slug);
  }
  return { slugs, legacy };
});

/**
 * The neighborhood an old URL slug refers to, or null. "canton-baltimore-md" always counts. A bare
 * slug ("canton") counts only with `bareSlugs`: under /best-breweries a bare slug is a city, and
 * 28 neighborhoods share their slug with a city (gaithersburg, westminster...).
 */
export async function resolveLegacyNeighborhoodSlug(
  slug: string,
  { bareSlugs = false }: { bareSlugs?: boolean } = {}
): Promise<string | null> {
  const { slugs, legacy } = await neighborhoodSlugs();
  return legacy.get(slug) ?? (bareSlugs && slugs.has(slug) ? slug : null);
}
