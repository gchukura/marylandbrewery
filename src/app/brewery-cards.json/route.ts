import { getProcessedBreweryData } from '@/lib/db';
import type { BreweryCardData } from '@/components/ui/BreweryCard';

// What /saved needs to draw cards; built with the site and loaded only by that page
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const { breweries } = await getProcessedBreweryData();
  const cards: BreweryCardData[] = breweries.map((b) => ({
    slug: b.slug,
    name: b.name,
    city: b.city,
    county: b.county,
    hours: b.hours,
    amenities: b.amenities,
    photos: b.photos?.slice(0, 1),
    photoUrl: b.photos?.length ? undefined : b.photoUrl,
  }));
  return Response.json(cards);
}
