import { notFound, permanentRedirect } from 'next/navigation';
import { resolveLegacyNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { neighborhoodPath } from '@/lib/neighborhoods';

/** Old neighborhood URLs ({neighborhood}-{city}-md) moved to /neighborhoods/[slug]. */
export default async function CitiesNearRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const neighborhoodSlug = await resolveLegacyNeighborhoodSlug(slug);
  if (neighborhoodSlug) {
    permanentRedirect(neighborhoodPath(neighborhoodSlug));
  }
  notFound();
}
