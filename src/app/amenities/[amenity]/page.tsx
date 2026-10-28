import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData } from '@/lib/db';
import {
  AMENITIES,
  cityAmenityPath,
  getAmenity,
  hasAmenity,
  isIndexableCityAmenity,
} from '@/lib/amenities';
import { slugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { amenityMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { amenityLinks } from '@/lib/listing-links';

export async function generateStaticParams() {
  return AMENITIES.map((a) => ({ amenity: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ amenity: string }>;
}): Promise<Metadata> {
  const amenity = getAmenity((await params).amenity);
  if (!amenity)
    return {
      title: 'Amenity Not Found',
      robots: { index: false, follow: false },
    };
  const processed = await getProcessedBreweryData();
  const count = processed.breweries.filter((b) =>
    hasAmenity(b, amenity)
  ).length;
  return buildMetadata({
    ...amenityMeta(amenity.label, count),
    path: `/amenities/${amenity.slug}`,
  });
}

export default async function AmenityPage({
  params,
}: {
  params: Promise<{ amenity: string }>;
}) {
  const amenity = getAmenity((await params).amenity);
  if (!amenity) notFound();
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries.filter((b) => hasAmenity(b, amenity));
  if (breweries.length === 0) notFound();

  // Cities with an indexed page for this amenity (3+ breweries)
  const cityCounts = new Map<string, { city: string; count: number }>();
  for (const b of breweries) {
    const entry = cityCounts.get(slugify(b.city)) ?? { city: b.city, count: 0 };
    entry.count++;
    cityCounts.set(slugify(b.city), entry);
  }
  const cityPages = [...cityCounts.entries()]
    .filter(([, c]) => isIndexableCityAmenity(c.count))
    .sort((a, b) => b[1].count - a[1].count)
    .map(([slug, c]) => ({
      label: c.city,
      href: cityAmenityPath(slug, amenity),
      count: c.count,
    }));

  const pagePath = `/amenities/${amenity.slug}`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `${amenity.label} Breweries in Maryland`,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="amenity"
        title={`${amenity.label} Breweries in Maryland`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Amenities', path: '/amenities' },
          { name: amenity.label, path: pagePath },
        ]}
        breweries={breweries}
        context={`${new Set(breweries.map((b) => b.city)).size} cities`}
        intro={<p className="m-0">{amenity.description}</p>}
        locked={{ amenity: amenity.slug }}
        related={[
          { title: `${amenity.label} breweries by city`, links: cityPages },
          {
            title: 'Other amenities',
            links: amenityLinks(processed.breweries, amenity.slug),
          },
        ]}
      />
    </>
  );
}
