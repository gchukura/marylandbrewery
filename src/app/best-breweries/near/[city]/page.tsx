import { notFound, permanentRedirect } from 'next/navigation';
import { getBreweriesByCity } from '@/lib/db';
import { deslugify } from '@/lib/slug';
import { bestBreweriesCityPath } from '@/lib/best-breweries';
import { parseNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { neighborhoodPath } from '@/lib/neighborhoods';

/**
 * /best-breweries/near/* is retired. Each URL permanently redirects to its main page:
 * neighborhoods to /neighborhoods/{slug}, cities to their best-of page or city listing.
 */
export default async function BestBreweriesNearRedirect({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;

  const neighborhoodData = await parseNeighborhoodSlug(city);
  if (neighborhoodData) {
    permanentRedirect(neighborhoodPath(neighborhoodData.neighborhood.slug));
  }

  const citySlug = city.endsWith('-md') ? city.slice(0, -3) : city;
  const breweries = await getBreweriesByCity(deslugify(citySlug));
  if (breweries.length > 0) {
    permanentRedirect(bestBreweriesCityPath(citySlug, breweries.length));
  }

  notFound();
}
