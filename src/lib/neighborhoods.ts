import { sortByDistance, type LatLng } from '@/lib/geo';
import { slugify } from '@/lib/slug';

/** A neighborhood page is indexed only if a brewery is within this distance. */
export const NEIGHBORHOOD_INDEX_RADIUS_MILES = 3;
/** Breweries listed on a neighborhood page. */
const NEIGHBORHOOD_BREWERY_RADIUS_MILES = 10;
/** If nothing is within the radius, still show this many of the nearest. */
const NEIGHBORHOOD_MIN_BREWERIES = 5;

export function neighborhoodPath(slug: string): string {
  return `/neighborhoods/${slug}`;
}

/**
 * The slug the old sitemap gave a neighborhood under /best-breweries: "{slug}-{city}-md"
 * (e.g. "canton-baltimore-md"). Null when the row has no city.
 */
export function legacyNeighborhoodSlug(neighborhood: { slug: string; city: string | null }): string | null {
  return neighborhood.city ? `${neighborhood.slug}-${slugify(neighborhood.city)}-md` : null;
}

/**
 * Breweries for a neighborhood page, nearest first: everything within 10 miles,
 * or the 5 nearest when nothing is that close.
 */
export function breweriesNearNeighborhood<T extends Partial<LatLng>>(
  neighborhood: LatLng,
  breweries: T[]
): (T & { distance: number })[] {
  const sorted = sortByDistance(neighborhood, breweries);
  const withinRadius = sorted.filter((b) => b.distance <= NEIGHBORHOOD_BREWERY_RADIUS_MILES);
  return withinRadius.length > 0 ? withinRadius : sorted.slice(0, NEIGHBORHOOD_MIN_BREWERIES);
}

export function isIndexableNeighborhood(nearestBreweryMiles: number | undefined): boolean {
  return nearestBreweryMiles !== undefined && nearestBreweryMiles <= NEIGHBORHOOD_INDEX_RADIUS_MILES;
}

const LISTED_ATTRACTION_TYPES = new Set(['park', 'museum', 'entertainment']);

/**
 * The attractions table's "landmark" type also holds shopping centers, offices and shops,
 * so landmarks are listed only when Google tags them as a tourist attraction.
 */
export function isListedAttraction(attraction: { type: string; googleTypes?: string[] }): boolean {
  return (
    LISTED_ATTRACTION_TYPES.has(attraction.type) ||
    (attraction.googleTypes ?? []).includes('tourist_attraction')
  );
}
