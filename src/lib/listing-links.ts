/**
 * Related links under listing pages. Only links to pages that exist and are indexed: city x amenity
 * pages with 3+ breweries, neighborhoods with a brewery within 3 miles, best-of pages for 5+ cities.
 */
import type { Brewery } from '@/types/brewery';
import type { Tables } from '@/lib/db';
import {
  AMENITIES,
  cityAmenityPath,
  hasAmenity,
  isIndexableCityAmenity,
  amenityPath,
} from '@/lib/amenities';
import {
  bestBreweriesCityPath,
  hasBestBreweriesPage,
} from '@/lib/best-breweries';
import { sortByDistance } from '@/lib/geo';
import { isIndexableNeighborhood, neighborhoodPath } from '@/lib/neighborhoods';
import { countyLabel, typePlural } from '@/lib/seo/page-meta';
import { slugify } from '@/lib/slug';
import type { RelatedGroup } from '@/components/listing/RelatedLinks';

type Link = RelatedGroup['links'][number];

/** Group by a key, with counts, largest first. */
function counted(
  breweries: Brewery[],
  key: (b: Brewery) => string | undefined
): { name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const b of breweries) {
    const name = key(b)?.trim();
    if (!name) continue;
    const slug = slugify(name);
    const entry = counts.get(slug) ?? { name, count: 0 };
    entry.count++;
    counts.set(slug, entry);
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export const cityLinks = (breweries: Brewery[], limit = 12): Link[] =>
  counted(breweries, (b) => b.city)
    .slice(0, limit)
    .map((c) => ({
      label: c.name,
      href: `/cities/${slugify(c.name)}/breweries`,
      count: c.count,
    }));

export const countyLinks = (breweries: Brewery[], limit = 24): Link[] =>
  counted(breweries, (b) => b.county)
    .slice(0, limit)
    .map((c) => ({
      label: countyLabel(c.name),
      href: `/counties/${slugify(c.name)}/breweries`,
      count: c.count,
    }));

/** Amenity pages, with how many of `breweries` have each. */
export const amenityLinks = (breweries: Brewery[], except?: string): Link[] =>
  AMENITIES.filter((a) => a.slug !== except)
    .map((a) => ({
      label: a.label,
      href: amenityPath(a),
      count: breweries.filter((b) => hasAmenity(b, a)).length,
    }))
    .filter((l) => l.count > 0);

/** Indexed city x amenity pages for one city. */
export function cityAmenityLinks(
  cityBreweries: Brewery[],
  citySlug: string,
  except?: string
): Link[] {
  return AMENITIES.filter((a) => a.slug !== except)
    .map((a) => ({
      label: a.label,
      href: cityAmenityPath(citySlug, a),
      count: cityBreweries.filter((b) => hasAmenity(b, a)).length,
    }))
    .filter((l) => isIndexableCityAmenity(l.count));
}

export function typeLinks(breweries: Brewery[], except?: string): Link[] {
  return [...new Set(breweries.flatMap((b) => b.type))]
    .filter((t) => slugify(t) !== except)
    .map((t) => ({
      label: typePlural(t),
      href: `/type/${slugify(t)}`,
      count: breweries.filter((b) => b.type.includes(t)).length,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Neighborhoods of a city that have their own (indexed) page. */
export function neighborhoodLinks(
  neighborhoods: Tables<'maryland_neighborhoods'>[],
  cityName: string,
  allBreweries: Brewery[]
): Link[] {
  return neighborhoods
    .filter(
      (n) => n.name.toLowerCase().trim() !== cityName.toLowerCase().trim()
    )
    .filter(
      (n): n is typeof n & { latitude: number; longitude: number } =>
        typeof n.latitude === 'number' && typeof n.longitude === 'number'
    )
    .filter((n) =>
      isIndexableNeighborhood(sortByDistance(n, allBreweries)[0]?.distance)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((n) => ({ label: n.name, href: neighborhoodPath(n.slug) }));
}

/** "Best breweries in X" and the county, for a city. */
export function cityMoreLinks(
  cityName: string,
  cityBreweries: Brewery[]
): Link[] {
  const citySlug = slugify(cityName);
  const links: Link[] = [];
  if (hasBestBreweriesPage(cityBreweries.length))
    links.push({
      label: `Best breweries in ${cityName}`,
      href: bestBreweriesCityPath(citySlug, cityBreweries.length),
    });
  const county = cityBreweries.find((b) => b.county)?.county;
  if (county)
    links.push({
      label: `${countyLabel(county)} breweries`,
      href: `/counties/${slugify(county)}/breweries`,
    });
  return links;
}
