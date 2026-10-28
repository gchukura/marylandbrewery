import { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { buildMetadata } from '@/lib/seo/metadata';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { countyLinks } from '@/lib/listing-links';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Interactive Brewery Map of Maryland',
  description:
    "Every craft brewery in Maryland on one interactive map. Filter by amenity, see what's open and get directions.",
  path: '/map',
});

// ?q= filters in the browser, so the page stays static. ?search= is 301'd to ?q= by the middleware.
export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const { breweries } = processed;

  return (
    <>
      <JsonLd
        data={collectionPage({
          name: 'Maryland Brewery Map',
          path: '/map',
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="state"
        title="Every brewery in Maryland, one map"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Brewery Map', path: '/map' },
        ]}
        breweries={breweries}
        context={`${processed.counties.length} counties`}
        related={[
          { title: 'Breweries by county', links: countyLinks(breweries) },
        ]}
      />
    </>
  );
}
