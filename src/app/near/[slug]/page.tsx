import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIndexableAttractions, getProcessedBreweryData } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { getAttractionBySlug } from '@/lib/db';

import { buildMetadata } from '@/lib/seo/metadata';
import { attractionMeta, countyLabel } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage from '@/components/listing/ListingPage';
import { isIndexableAttraction } from '@/lib/attractions';
import { calculateDistance, sortByDistance } from '@/lib/geo';

const NEARBY_MILES = 10;
// Prerender the indexed attraction pages (the same list as the sitemap); others render on demand
export async function generateStaticParams() {
  return (await getIndexableAttractions()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const attraction = await getAttractionBySlug(slug);

  if (!attraction) {
    return {
      title: 'Attraction Not Found',
      robots: { index: false, follow: false },
    };
  }

  const processed = await getProcessedBreweryData();
  const nearbyBreweries = processed.breweries
    .filter((brewery: any) => {
      if (!brewery.latitude || !brewery.longitude) return false;
      const distance = calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      );
      return distance <= 10;
    })
    .map((brewery: any) => ({
      ...brewery,
      distance: calculateDistance(
        attraction.latitude,
        attraction.longitude,
        brewery.latitude,
        brewery.longitude
      ),
    }))
    .sort((a: any, b: any) => a.distance - b.distance);

  return buildMetadata({
    ...attractionMeta(attraction.name, attraction.city, nearbyBreweries.length),
    path: `/near/${attraction.slug}`,
    // Index real sights with a brewery within 3 miles (src/lib/attractions.ts)
    noindex: !isIndexableAttraction(attraction, nearbyBreweries[0]?.distance),
  });
}

export default async function NearAttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const attraction = await getAttractionBySlug(slug);
  if (!attraction) notFound();

  const processed = await getProcessedBreweryData();
  const origin = {
    latitude: attraction.latitude,
    longitude: attraction.longitude,
  };
  const nearby = sortByDistance(origin, processed.breweries).filter(
    (b) => b.distance <= NEARBY_MILES
  );

  const pagePath = `/near/${attraction.slug}`;
  const title = `Breweries near ${attraction.name}`;
  const nearest = nearby[0]?.distance;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: title,
          path: pagePath,
          breweries: nearby,
        })}
      />
      <ListingPage
        scope="neighborhood"
        title={title}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          ...(attraction.city
            ? [
                {
                  name: `${attraction.city}, MD`,
                  path: `/cities/${slugify(attraction.city)}/breweries`,
                },
              ]
            : []),
          { name: attraction.name, path: pagePath },
        ]}
        breweries={nearby}
        summary={
          nearest === undefined
            ? `No breweries within ${NEARBY_MILES} miles.`
            : `${nearby.length} ${nearby.length === 1 ? 'brewery' : 'breweries'} within ${NEARBY_MILES} miles. The nearest is ${nearest.toFixed(1)} miles away.`
        }
        intro={
          attraction.description ? (
            <p className="m-0">{attraction.description}</p>
          ) : undefined
        }
        origin={origin}
        related={[
          {
            title: 'More nearby',
            links: [
              ...(attraction.city
                ? [
                    {
                      label: `${attraction.city} breweries`,
                      href: `/cities/${slugify(attraction.city)}/breweries`,
                    },
                  ]
                : []),
              ...(attraction.county
                ? [
                    {
                      label: `${countyLabel(attraction.county)} breweries`,
                      href: `/counties/${slugify(attraction.county)}/breweries`,
                    },
                  ]
                : []),
              { label: 'Brewery map', href: '/map' },
            ],
          },
        ]}
      />
    </>
  );
}
