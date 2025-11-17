import { Metadata } from 'next';
import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';

const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function normalizeAmenityLabel(slug: string): string {
  return deslugify(slug).replace(/\bWifi\b/i, 'WiFi');
}

export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  const cities = processed.cities; // already unique and normalized to display case

  const combinations: { city: string; amenity: string }[] = [];
  for (const city of cities) {
    for (const amenity of AMENITY_SLUGS) {
      combinations.push({ city: slugify(city), amenity });
    }
  }
  return combinations;
}

export async function generateMetadata({ params }: { params: { city: string; amenity: string } }): Promise<Metadata> {
  const processed = await getProcessedBreweryData();
  const cityName = deslugify(params.city);
  const amenityLabel = normalizeAmenityLabel(params.amenity);
  const amenityKey = amenityLabel.toLowerCase();

  const breweries = processed.breweries.filter(
    (b) => b.city.toLowerCase() === cityName.toLowerCase() &&
      (((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey)))
  );

  const title = `${amenityLabel} Breweries in ${cityName}, MD - ${breweries.length} Locations`;
  const description = breweries.length > 0
    ? `Find ${breweries.length} breweries with ${amenityLabel.toLowerCase()} in ${cityName}, Maryland. Explore local taprooms and brewpubs.`
    : `No breweries with ${amenityLabel.toLowerCase()} are listed in ${cityName} yet. See nearby cities and related amenities.`;

  return {
    title,
    description,
    alternates: { canonical: `/city/${params.city}/${params.amenity}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/city/${params.city}/${params.amenity}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${amenityLabel} Breweries in ${cityName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function CityAmenityPage({ params }: { params: { city: string; amenity: string } }) {
  const processed = await getProcessedBreweryData();
  const cityName = deslugify(params.city);
  const amenityLabel = normalizeAmenityLabel(params.amenity);
  const amenityKey = amenityLabel.toLowerCase();

  const breweries = processed.breweries.filter(
    (b) => b.city.toLowerCase() === cityName.toLowerCase() &&
      (((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey)))
  );

  // Nearby cities with this amenity (if none in current city)
  const cityToCount = new Map<string, number>();
  for (const b of processed.breweries) {
    const hasAmenity = ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey));
    if (hasAmenity) {
      cityToCount.set(b.city, (cityToCount.get(b.city) || 0) + 1);
    }
  }
  const nearby = Array.from(cityToCount.entries())
    .filter(([c]) => c.toLowerCase() !== cityName.toLowerCase())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([c]) => ({ title: `${c} Breweries`, url: `/city/${slugify(c)}/breweries`, type: 'city' }));

  const stats = {
    title: `${amenityLabel} in ${cityName}`,
    stats: [
      { label: 'Total Breweries', value: breweries.length },
      { label: 'Cities With This Amenity', value: cityToCount.size },
    ],
    lastUpdated: new Date().toISOString(),
  } as any;

  const introText = breweries.length > 0
    ? `${cityName} has ${breweries.length} breweries offering ${amenityLabel.toLowerCase()}. Discover local favorites and plan your visit.`
    : `No breweries with ${amenityLabel.toLowerCase()} are listed in ${cityName} yet. Consider nearby cities like ${nearby.slice(0,3).map(n => n.title.replace(' Breweries','')).join(', ')}.`;

  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Maryland', url: '/city', position: 2, isActive: false },
    { name: cityName, url: `/city/${params.city}/breweries`, position: 3, isActive: false },
    { name: amenityLabel, url: `/city/${params.city}/${params.amenity}`, position: 4, isActive: true },
  ];

  const related = [
    { title: `All ${cityName} Breweries`, url: `/city/${params.city}/breweries`, type: 'city' },
    { title: `${amenityLabel} Breweries (Statewide)`, url: `/amenities/${params.amenity}`, type: 'amenity' },
  ];

  return (
    <SimpleProgrammaticPageTemplate
      title={`${amenityLabel} Breweries in ${cityName}, MD - ${breweries.length} Locations`}
      metaDescription={`Explore ${amenityLabel.toLowerCase()} breweries in ${cityName}, Maryland.`}
      h1={`${amenityLabel} Breweries in ${cityName}`}
      introText={introText}
      breweries={breweries as any}
      stats={stats}
      breadcrumbs={breadcrumbs as any}
      relatedPages={related.concat(nearby as any) as any}
      pageType="city"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{ city: cityName, amenity: amenityLabel }}
    />
  );
}
