import { cache } from 'react';
import { getAllNeighborhoods } from '@/lib/db';
import { legacyNeighborhoodSlug } from '@/lib/neighborhoods';

/**
 * Old URL slug -> /neighborhoods slug, built from every row: each neighborhood answers to its
 * own slug and to the "{neighborhood}-{city}-md" slug the old sitemap generated. Exact matches
 * only; anything else is not a neighborhood. Built once per request (a Map can't go in unstable_cache).
 */
const legacyNeighborhoodIndex = cache(async (): Promise<Map<string, string>> => {
  const index = new Map<string, string>();
  for (const n of await getAllNeighborhoods()) {
    index.set(n.slug, n.slug);
    const legacy = legacyNeighborhoodSlug(n);
    if (legacy) index.set(legacy, n.slug);
  }
  return index;
});

/** The neighborhood an old URL slug ("canton-baltimore-md" or "canton") refers to, or null. */
export async function resolveLegacyNeighborhoodSlug(slug: string): Promise<string | null> {
  return (await legacyNeighborhoodIndex()).get(slug) ?? null;
}
