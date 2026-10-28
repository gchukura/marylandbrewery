/**
 * /best-breweries/[city] exists only for cities with enough breweries to rank.
 * Everything else under /best-breweries (smaller cities, counties, regions, near/ and -md
 * variants) permanently redirects to its main page.
 */
const MIN_BREWERIES_FOR_BEST_PAGE = 5;

export function hasBestBreweriesPage(breweryCount: number): boolean {
  return breweryCount >= MIN_BREWERIES_FOR_BEST_PAGE;
}

/** The canonical page for a city's breweries: its best-of page if it has one, else the city listing. */
export function bestBreweriesCityPath(citySlug: string, breweryCount: number): string {
  return hasBestBreweriesPage(breweryCount)
    ? `/best-breweries/${citySlug}`
    : `/cities/${citySlug}/breweries`;
}

interface Rated {
  googleRating?: number;
  googleRatingCount?: number;
  yelpRating?: number;
  yelpRatingCount?: number;
}

/** How best-of pages rank breweries, shown on the page. */
export const SCORE_EXPLANATION =
  'Ranked by Google rating and how many people rated it: score = rating × 20 + log10(review count) × 10. ' +
  'A 4.7 from 1,000 reviews ranks above a 5.0 from three.';

export function breweryScore(brewery: Rated): number {
  const rating = brewery.googleRating ?? 0;
  const reviews = brewery.googleRatingCount ?? 0;
  return rating * 20 + (reviews > 0 ? Math.log10(reviews) * 10 : 0);
}

/** One line explaining a brewery's place in the ranking. */
export function rankingReason(brewery: Rated): string {
  if (brewery.googleRating) {
    const count = brewery.googleRatingCount ?? 0;
    return `${brewery.googleRating.toFixed(1)}★ from ${count.toLocaleString('en-US')} Google review${count === 1 ? '' : 's'}`;
  }
  if (brewery.yelpRating) {
    return `No Google rating yet (${brewery.yelpRating.toFixed(1)}★ on Yelp)`;
  }
  return 'No ratings yet';
}
