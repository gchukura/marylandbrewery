/**
 * The site search typeahead. The index is built at build time (/search-index.json) and matched in
 * the browser: brewery names, cities, counties and amenities, about 10 KB.
 */
import type { Brewery } from '@/types/brewery';
import { AMENITIES, amenityPath } from '@/lib/amenities';
import { countyLabel } from '@/lib/seo/page-meta';
import { slugify } from '@/lib/slug';

export type SearchKind = 'brewery' | 'city' | 'county' | 'amenity';

export interface SearchItem {
  kind: SearchKind;
  label: string;
  href: string;
  /** Shown under the label: a brewery's city, a city's brewery count */
  detail: string;
}

/** Compact on the wire: [label, path, detail] per item, grouped by kind. */
export type SearchIndex = Record<SearchKind, [string, string, string][]>;

const plural = (n: number) => `${n} ${n === 1 ? 'brewery' : 'breweries'}`;

export function buildSearchIndex(breweries: Brewery[]): SearchIndex {
  const count = (key: (b: Brewery) => string | undefined) => {
    const counts = new Map<string, { name: string; n: number }>();
    for (const b of breweries) {
      const name = key(b)?.trim();
      if (!name) continue;
      const entry = counts.get(slugify(name)) ?? { name, n: 0 };
      entry.n++;
      counts.set(slugify(name), entry);
    }
    return [...counts.entries()].sort((a, b) =>
      a[1].name.localeCompare(b[1].name)
    );
  };
  return {
    brewery: breweries
      .filter((b) => b.slug && b.name)
      .map((b) => [b.name, `/breweries/${b.slug}`, b.city ?? '']),
    city: count((b) => b.city).map(([slug, c]) => [
      c.name,
      `/cities/${slug}/breweries`,
      plural(c.n),
    ]),
    county: count((b) => b.county).map(([slug, c]) => [
      countyLabel(c.name),
      `/counties/${slug}/breweries`,
      plural(c.n),
    ]),
    amenity: AMENITIES.map((a) => [a.label, amenityPath(a), 'Amenity']),
  };
}

export function expandSearchIndex(index: SearchIndex): SearchItem[] {
  return (Object.keys(index) as SearchKind[]).flatMap((kind) =>
    index[kind].map(([label, href, detail]) => ({ kind, label, href, detail }))
  );
}

const fold = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').toLowerCase();
const KIND_ORDER: Record<SearchKind, number> = {
  city: 0,
  county: 1,
  amenity: 2,
  brewery: 3,
};

/**
 * Best matches for a query: a label starting with the query beats a word starting with it, which
 * beats a match anywhere. Every query word must match. Places come before breweries on ties.
 */
export function matchSearch(
  items: SearchItem[],
  query: string,
  limit = 8
): SearchItem[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const label = fold(item.label);
    if (!words.every((w) => label.includes(w))) continue;
    const joined = words.join(' ');
    const score = label.startsWith(joined)
      ? 0
      : label.split(/[\s/&-]+/).some((part) => part.startsWith(words[0]))
        ? 1
        : 2;
    scored.push({ item, score });
  }
  return scored
    .sort(
      (a, b) =>
        a.score - b.score ||
        KIND_ORDER[a.item.kind] - KIND_ORDER[b.item.kind] ||
        a.item.label.localeCompare(b.item.label)
    )
    .slice(0, limit)
    .map((s) => s.item);
}
