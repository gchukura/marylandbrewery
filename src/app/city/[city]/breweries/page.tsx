import { Metadata } from 'next';
import SimpleProgrammaticPageTemplate from '@/components/templates/SimpleProgrammaticPageTemplate';
import { getAllCities, getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify, isOpenNow } from '@/lib/data-utils';
import { generateCityIntroText } from '@/lib/content-generators';

// Build all city pages (no limit)
export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map((city) => ({ city: slugify(city) }));
}

function collectAmenities(breweries: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of breweries) {
    const amenities = (b as any).amenities || b.features || [];
    for (const a of amenities) {
      const key = a.trim();
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityName = deslugify(params.city);
  const processed = await getProcessedBreweryData();
  const breweries = processed.byCity.get(cityName.toLowerCase().trim()) || [];
  const total = breweries.length;
  const amenityCounts = collectAmenities(breweries);
  const topAmenities = Object.entries(amenityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join(', ');

  const title = `${cityName} Breweries - ${total} Craft Breweries in ${cityName}, MD`;
  const description = `${cityName} has ${total} craft breweries. Popular amenities: ${topAmenities || 'varied options'}. Explore local taprooms, brewpubs, and tasting rooms in ${cityName}, Maryland.`;

  return {
    title,
    description,
    alternates: { canonical: `/city/${params.city}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://marylandbrewery.com/city/${params.city}/breweries`,
      type: 'website',
    },
  };
}

function computeCityStats(breweries: any[]) {
  const total = breweries.length;
  const withFood = breweries.filter((b) =>
    ((b as any).amenities || b.features || []).some((a: string) => /food|kitchen|restaurant/i.test(a))
  ).length;
  const withTours = breweries.filter((b) => (b as any).offersTours === true).length;
  const openNow = breweries.filter((b) => isOpenNow(b)).length;

  return {
    title: 'City Statistics',
    stats: [
      { label: 'Total Breweries', value: total },
      { label: 'With Food', value: withFood },
      { label: 'Offer Tours', value: withTours },
      { label: 'Open Now', value: openNow },
    ],
    lastUpdated: new Date().toISOString(),
  } as any;
}

export default async function CityBreweriesPage({ params }: { params: { city: string } }) {
  const cityName = deslugify(params.city);
  const processed = await getProcessedBreweryData();
  const breweries = processed.byCity.get(cityName.toLowerCase().trim()) || [];

  // Intro text
  const statsForIntro = { totalBreweries: breweries.length, totalCounties: 0, totalTypes: 0 };
  const introText = generateCityIntroText(cityName, breweries.length, statsForIntro);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1, isActive: false },
    { name: 'Maryland', url: '/city', position: 2, isActive: false },
    { name: cityName, url: `/city/${params.city}/breweries`, position: 3, isActive: true },
  ];

  // Nearby cities: pick other cities sharing any county among this city's breweries
  const allCities = await getAllCities();
  const cityCounty = (breweries[0] as any)?.county || '';
  const nearby = allCities
    .filter((c) => c.toLowerCase() !== cityName.toLowerCase())
    .slice(0, 6)
    .map((c) => ({ title: `${c} Breweries`, url: `/city/${slugify(c)}/breweries`, type: 'city' }));

  const stats = computeCityStats(breweries);

  return (
    <SimpleProgrammaticPageTemplate
      title={`${cityName} Breweries - ${breweries.length} Craft Breweries in ${cityName}, MD`}
      metaDescription={`Discover ${breweries.length} breweries in ${cityName}, Maryland. Explore local brewpubs, taprooms, and craft beer destinations.`}
      h1={`Breweries in ${cityName}`}
      introText={introText}
      breweries={breweries as any}
      stats={stats}
      breadcrumbs={breadcrumbs as any}
      relatedPages={nearby as any}
      pageType="city"
      showMap={true}
      showStats={true}
      showRelatedPages={true}
      currentFilters={{ city: cityName }}
    />
  );
}
