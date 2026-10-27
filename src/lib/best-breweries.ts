/**
 * /best-breweries/[city] exists only for cities with enough breweries to rank.
 * Everything else under /best-breweries (smaller cities, counties, regions, near/ and -md
 * variants) permanently redirects to its main page.
 */
export const MIN_BREWERIES_FOR_BEST_PAGE = 5;

export function hasBestBreweriesPage(breweryCount: number): boolean {
  return breweryCount >= MIN_BREWERIES_FOR_BEST_PAGE;
}

/** The canonical page for a city's breweries: its best-of page if it has one, else the city listing. */
export function bestBreweriesCityPath(citySlug: string, breweryCount: number): string {
  return hasBestBreweriesPage(breweryCount)
    ? `/best-breweries/${citySlug}`
    : `/cities/${citySlug}/breweries`;
}
