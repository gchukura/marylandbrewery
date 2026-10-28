/**
 * The one map of amenities: URL slug -> label -> value stored in breweries.amenities.
 * The sitemap, /amenities, /amenities/[amenity], /cities/[city]/[amenity], the middleware's
 * redirects and every amenity link use it.
 */

export interface AmenityDefinition {
  slug: string;
  label: string;
  /** The exact string in breweries.amenities */
  dbValue: string;
  description: string;
}

export const AMENITIES: readonly AmenityDefinition[] = [
  {
    slug: 'full-kitchen',
    label: 'Full Kitchen',
    dbValue: 'Full Kitchen',
    description:
      'More than just bar snacks: these breweries serve food, from appetizers to full meals, often designed to complement the house beers.',
  },
  {
    slug: 'outdoor-seating',
    label: 'Outdoor Seating',
    dbValue: 'Outdoor Seating',
    description:
      "Enjoy your craft beer under the open sky. Breweries with outdoor seating offer patios, decks, beer gardens or lawn areas, perfect for Maryland's good-weather days.",
  },
  {
    slug: 'beer-to-go',
    label: 'Beer To Go',
    dbValue: 'Beer To Go',
    description:
      'Take fresh beer home. These breweries sell cans, bottles, crowlers or growler fills to go.',
  },
  {
    slug: 'pet-friendly',
    label: 'Pet Friendly',
    dbValue: 'Pet Friendly',
    description:
      'Bring your four-legged friend along. Pet-friendly breweries welcome well-behaved dogs, often with water bowls and plenty of attention from fellow beer lovers.',
  },
  {
    slug: 'parking',
    label: 'Parking',
    dbValue: 'Parking',
    description:
      'Skip the parking hassle. These breweries have dedicated lots or ample street parking.',
  },
  {
    slug: 'other-drinks',
    label: 'Other Drinks',
    dbValue: 'Other Drinks',
    description:
      'Not everyone in your group drinks beer. These breweries also pour wine, cider, seltzer, cocktails or non-alcoholic options.',
  },
  {
    slug: 'tours',
    label: 'Tours',
    dbValue: 'Tours',
    description:
      'Go behind the scenes. Brewery tours walk you through the brewing process, from grain to glass, often ending with a tasting.',
  },
  {
    slug: 'merchandise',
    label: 'Merchandise',
    dbValue: 'Merchandise',
    description:
      'Take home more than memories. These breweries sell branded merchandise: shirts, hats, glassware and more.',
  },
];

/**
 * Old or duplicate slugs. A string is the canonical slug to 301 to; null means the amenity has no
 * page (it applies to nearly every brewery), so redirect to the amenities index or the city listing.
 */
export const AMENITY_ALIASES: Readonly<Record<string, string | null>> = {
  food: 'full-kitchen', // 'Food' and 'Full Kitchen' are set on exactly the same 128 breweries
  'in-house': 'full-kitchen',
  'dog-friendly': 'pet-friendly',
  'allows-visitors': null, // 147 of 151 breweries
  'visitors-welcome': null,
};

/** City x amenity pages with fewer breweries are noindex and left out of the sitemap. */
const MIN_BREWERIES_FOR_CITY_AMENITY_INDEX = 3;

export function getAmenity(slug: string): AmenityDefinition | undefined {
  return AMENITIES.find((a) => a.slug === slug);
}

/** The amenity whose stored value is exactly this one (for chips: 'Food' and 'Allows Visitors' get none). */
export function amenityByDbValue(dbValue: string): AmenityDefinition | undefined {
  return AMENITIES.find((a) => a.dbValue === dbValue.trim());
}

/** The amenity page for a stored value, following aliases: 'Food' -> Full Kitchen. */
export function amenityForValue(dbValue: string): AmenityDefinition | undefined {
  const direct = AMENITIES.find((a) => a.dbValue.toLowerCase() === dbValue.toLowerCase());
  if (direct) return direct;
  const alias = AMENITY_ALIASES[dbValue.toLowerCase().replace(/\s+/g, '-')];
  return alias ? getAmenity(alias) : undefined;
}

export function hasAmenity(brewery: { amenities: string[] }, amenity: AmenityDefinition): boolean {
  return brewery.amenities.includes(amenity.dbValue);
}

export function amenityPath(amenity: AmenityDefinition): string {
  return `/amenities/${amenity.slug}`;
}

export function cityAmenityPath(citySlug: string, amenity: AmenityDefinition): string {
  return `/cities/${citySlug}/${amenity.slug}`;
}

export function isIndexableCityAmenity(breweryCount: number): boolean {
  return breweryCount >= MIN_BREWERIES_FOR_CITY_AMENITY_INDEX;
}
