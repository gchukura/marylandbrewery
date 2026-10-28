import { isListedAttraction } from '@/lib/neighborhoods';

/** An attraction page is indexed only if a brewery is within this distance. */
const ATTRACTION_INDEX_RADIUS_MILES = 3;

/**
 * /near/[slug] pages worth indexing: real sights (parks, museums, entertainment, Google
 * tourist attractions; not shops or offices) with a brewery within 3 miles.
 */
export function isIndexableAttraction(
  attraction: { type: string; googleTypes?: string[] },
  nearestBreweryMiles: number | undefined
): boolean {
  return (
    isListedAttraction(attraction) &&
    nearestBreweryMiles !== undefined &&
    nearestBreweryMiles <= ATTRACTION_INDEX_RADIUS_MILES
  );
}
