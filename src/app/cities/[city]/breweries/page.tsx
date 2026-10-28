import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllCities,
  getBreweriesByCity,
  getNeighborhoodsByCity,
  getProcessedBreweryData,
} from '@/lib/db';
import { slugify, deslugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { cityMeta, countyLabel } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import {
  cityAmenityLinks,
  cityMoreLinks,
  neighborhoodLinks,
} from '@/lib/listing-links';

// Build all city pages (no limit)
export async function generateStaticParams() {
  // No try/catch: a data error here should fail the build, not ship zero city pages
  const cities = await getAllCities();
  return cities
    .filter((city) => city.trim().length > 0)
    .map((city) => ({ city: slugify(city) }));
}

// -md URLs are 301'd by the middleware; strip the suffix in case one gets here
const citySlugFrom = (param: string) =>
  param.endsWith('-md') ? param.slice(0, -3) : param;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const citySlug = citySlugFrom((await params).city);
  const cityName = deslugify(citySlug);
  const breweries = await getBreweriesByCity(cityName);
  // Proper casing ("Havre de Grace") comes from the data, not the slug
  const displayName = breweries[0]?.city ?? cityName;
  return buildMetadata({
    ...cityMeta(displayName, breweries.length),
    path: `/cities/${citySlug}/breweries`,
  });
}

export default async function CityBreweriesPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const citySlug = citySlugFrom((await params).city);
  const breweries = await getBreweriesByCity(deslugify(citySlug));
  if (breweries.length === 0) notFound();

  const city = breweries[0].city;
  const county = breweries.find((b) => b.county)?.county;
  const [neighborhoods, processed] = await Promise.all([
    getNeighborhoodsByCity(city),
    getProcessedBreweryData(),
  ]);

  const pagePath = `/cities/${citySlug}/breweries`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `Breweries in ${city}, MD`,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="city"
        title={`Breweries in ${city}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Cities', path: '/cities' },
          { name: `${city}, MD`, path: pagePath },
        ]}
        breweries={breweries}
        context={county ? countyLabel(county) : undefined}
        related={[
          {
            title: `Neighborhoods in ${city}`,
            links: neighborhoodLinks(neighborhoods, city, processed.breweries),
          },
          {
            title: `${city} breweries by amenity`,
            links: cityAmenityLinks(breweries, citySlug),
          },
          { title: 'More nearby', links: cityMoreLinks(city, breweries) },
        ]}
      />
    </>
  );
}
