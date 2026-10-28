import { notFound, permanentRedirect } from 'next/navigation';
import { getBreweriesByCity } from '@/lib/db';
import { deslugify } from '@/lib/slug';
import { bestBreweriesCityPath } from '@/lib/best-breweries';
import { resolveLegacyNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { neighborhoodPath } from '@/lib/neighborhoods';

/**
 * /cities/near/{slug}/breweries is retired. Cities go to their best-of page (5+ breweries) or
 * city listing; neighborhoods ("canton" or "canton-baltimore-md") go to /neighborhoods/{slug}.
 */
export default async function CitiesNearBreweriesRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const citySlug = slug.endsWith('-md') ? slug.slice(0, -3) : slug;
  const cityBreweries = await getBreweriesByCity(deslugify(citySlug));
  if (cityBreweries.length > 0) {
    permanentRedirect(bestBreweriesCityPath(citySlug, cityBreweries.length));
  }

  const neighborhoodSlug = await resolveLegacyNeighborhoodSlug(slug);
  if (neighborhoodSlug) {
    permanentRedirect(neighborhoodPath(neighborhoodSlug));
  }

  notFound();
}
