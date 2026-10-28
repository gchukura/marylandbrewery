import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData } from '@/lib/db';
import {
  AMENITIES,
  getAmenity,
  hasAmenity,
  isIndexableCityAmenity,
  type AmenityDefinition,
} from '@/lib/amenities';
import type { Brewery } from '@/types/brewery';
import { slugify, deslugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { cityAmenityMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { cityAmenityLinks, cityMoreLinks } from '@/lib/listing-links';

function cityAmenityBreweries(
  breweries: Brewery[],
  cityName: string,
  amenityDef: AmenityDefinition
): Brewery[] {
  const cityKey = cityName.toLowerCase();
  return breweries.filter(
    (b) => b.city.toLowerCase() === cityKey && hasAmenity(b, amenityDef)
  );
}

// Prerender the indexable pages (3+ breweries); smaller ones render on request with noindex
export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  return AMENITIES.flatMap((amenityDef) =>
    processed.cities
      .filter((city) =>
        isIndexableCityAmenity(
          cityAmenityBreweries(processed.breweries, city, amenityDef).length
        )
      )
      .map((city) => ({ city: slugify(city), amenity: amenityDef.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; amenity: string }>;
}): Promise<Metadata> {
  const { city, amenity } = await params;
  const amenityDef = getAmenity(amenity);
  if (!amenityDef)
    return { title: 'Not Found', robots: { index: false, follow: false } };
  const processed = await getProcessedBreweryData();
  const cityName = deslugify(city);
  const breweries = cityAmenityBreweries(
    processed.breweries,
    cityName,
    amenityDef
  );
  const displayCity = breweries[0]?.city ?? cityName;
  return buildMetadata({
    ...cityAmenityMeta(amenityDef.label, displayCity, breweries.length),
    path: `/cities/${city}/${amenity}`,
    noindex: !isIndexableCityAmenity(breweries.length),
  });
}

export default async function CityAmenityPage({
  params,
}: {
  params: Promise<{ city: string; amenity: string }>;
}) {
  const { city, amenity } = await params;
  const amenityDef = getAmenity(amenity);
  if (!amenityDef) notFound();
  const processed = await getProcessedBreweryData();
  const breweries = cityAmenityBreweries(
    processed.breweries,
    deslugify(city),
    amenityDef
  );
  if (breweries.length === 0) notFound();

  const displayCity = breweries[0].city;
  const cityBreweries =
    processed.byCity.get(displayCity.toLowerCase().trim()) ?? breweries;
  const pagePath = `/cities/${city}/${amenity}`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `${amenityDef.label} Breweries in ${displayCity}, MD`,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="city-amenity"
        title={`${amenityDef.label} Breweries in ${displayCity}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Cities', path: '/cities' },
          { name: `${displayCity}, MD`, path: `/cities/${city}/breweries` },
          { name: amenityDef.label, path: pagePath },
        ]}
        breweries={breweries}
        context={`of ${cityBreweries.length} in ${displayCity}`}
        intro={<p className="m-0">{amenityDef.description}</p>}
        locked={{ amenity: amenityDef.slug }}
        related={[
          {
            title: `More in ${displayCity}`,
            links: [
              {
                label: `All ${displayCity} breweries`,
                href: `/cities/${city}/breweries`,
                count: cityBreweries.length,
              },
              ...cityMoreLinks(displayCity, cityBreweries),
            ],
          },
          {
            title: `${displayCity} breweries by amenity`,
            links: cityAmenityLinks(cityBreweries, city, amenityDef.slug),
          },
        ]}
      />
    </>
  );
}
