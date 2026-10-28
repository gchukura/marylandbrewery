import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getAllNeighborhoods, getAttractionsNearBrewery, getNeighborhoodBySlug, getProcessedBreweryData } from '@/lib/db';
import type { Tables } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { milesToKm, sortByDistance } from '@/lib/geo';
import {
  NEIGHBORHOOD_INDEX_RADIUS_MILES,
  breweriesNearNeighborhood,
  isIndexableNeighborhood,
  isListedAttraction,
  neighborhoodPath,
} from '@/lib/neighborhoods';
import CityBreweriesMapClient from '../../cities/[city]/breweries/CityBreweriesMapClient';

const ATTRACTION_LIMIT = 6;
// Fetch extra so filtering out shops and offices still leaves enough to show
const ATTRACTION_CANDIDATES = 60;

type NeighborhoodWithCoords = Tables<'maryland_neighborhoods'> & { latitude: number; longitude: number };

function hasCoords(n: Tables<'maryland_neighborhoods'>): n is NeighborhoodWithCoords {
  return typeof n.latitude === 'number' && typeof n.longitude === 'number';
}

async function loadNeighborhood(slug: string) {
  const neighborhood = await getNeighborhoodBySlug(slug);
  if (!neighborhood || !hasCoords(neighborhood) || !neighborhood.city) return null;

  const processed = await getProcessedBreweryData();
  const breweries = breweriesNearNeighborhood(neighborhood, processed.breweries);
  const nearestMiles = breweries[0]?.distance;
  return { neighborhood, city: neighborhood.city, breweries, nearestMiles };
}

// Prerender the neighborhoods that are indexed; the rest render on first request.
export async function generateStaticParams() {
  const [neighborhoods, processed] = await Promise.all([getAllNeighborhoods(), getProcessedBreweryData()]);
  return neighborhoods
    .filter(hasCoords)
    .filter((n) => isIndexableNeighborhood(sortByDistance(n, processed.breweries)[0]?.distance))
    .map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadNeighborhood(slug);
  if (!data) return { title: 'Neighborhood Not Found', robots: { index: false, follow: false } };

  const { neighborhood, city, breweries, nearestMiles } = data;
  const title = `Breweries near ${neighborhood.name}, ${city}, MD`;
  const description = `${breweries.length} craft ${breweries.length === 1 ? 'brewery' : 'breweries'} near ${neighborhood.name} in ${city}, Maryland, sorted by distance, plus things to do nearby.`;
  const path = neighborhoodPath(neighborhood.slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    // Thin pages: only index neighborhoods with a brewery within 3 miles
    robots: isIndexableNeighborhood(nearestMiles) ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com${path}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadNeighborhood(slug);
  if (!data) notFound();

  const { neighborhood, city, breweries, nearestMiles } = data;
  const citySlug = slugify(city);
  const withinIndexRadius = breweries.filter((b) => b.distance <= NEIGHBORHOOD_INDEX_RADIUS_MILES).length;
  const nearbyAttractions = await getAttractionsNearBrewery(
    neighborhood.latitude,
    neighborhood.longitude,
    milesToKm(NEIGHBORHOOD_INDEX_RADIUS_MILES),
    ATTRACTION_CANDIDATES
  );
  const attractions = sortByDistance(neighborhood, nearbyAttractions.filter(isListedAttraction)).slice(0, ATTRACTION_LIMIT);

  return (
    <div className="min-h-screen">
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
              <li><Link href="/" className="hover:underline">Maryland Breweries</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li><Link href="/cities" className="hover:underline">Cities</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li><Link href={`/cities/${citySlug}/breweries`} className="hover:underline">{city}, MD</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
              <li aria-current="page" className="font-medium text-gray-900">{neighborhood.name}</li>
            </ol>
          </nav>

          <h1 className="mb-4 font-[family-name:var(--font-playfair-display)] text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Breweries near {neighborhood.name}, {city}, MD
          </h1>
          <p className="text-lg text-gray-700">
            {nearestMiles === undefined
              ? 'No breweries found nearby.'
              : withinIndexRadius > 0
                ? `${withinIndexRadius} ${withinIndexRadius === 1 ? 'brewery' : 'breweries'} within ${NEIGHBORHOOD_INDEX_RADIUS_MILES} miles. The nearest is ${nearestMiles.toFixed(1)} miles away.`
                : `The nearest brewery is ${nearestMiles.toFixed(1)} miles away.`}
          </p>
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <CityBreweriesMapClient
            breweries={breweries}
            cityName={city}
            neighborhoods={[]}
            neighborhood={neighborhood}
            showNeighborhoods={false}
            isNearPage={true}
          />
        </div>
      </section>

      {attractions.length > 0 && (
        <section className="border-t py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 font-[family-name:var(--font-playfair-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              Things to do near {neighborhood.name}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction) => (
                <li key={attraction.slug}>
                  <Link
                    href={`/near/${attraction.slug}`}
                    className="block h-full rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <p className="font-semibold text-gray-900">{attraction.name}</p>
                    <p className="text-sm capitalize text-gray-600">
                      {attraction.type.replace(/_/g, ' ')} · {attraction.distance.toFixed(1)} mi
                    </p>
                    <p className="mt-2 text-sm text-gray-700">Breweries near {attraction.name} →</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
