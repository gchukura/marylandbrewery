import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify, isOpenNow } from '@/lib/data-utils';
import { generateComboIntroText } from '@/lib/content-generators';
import { truncateTitle, optimizeDescription } from '@/lib/seo-utils';

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
  const cityKey = cityName.toLowerCase();
  const amenityLabel = normalizeAmenityLabel(params.amenity);
  const amenityKey = amenityLabel.toLowerCase();

  // Optimize: use pre-indexed city data if available
  const cityBreweries = processed.byCity.get(cityKey) || [];
  const breweries = cityBreweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey))
  );

  const title = `${amenityLabel} in ${cityName}, MD | ${breweries.length}`;
  
  const description = breweries.length > 0
    ? `Find ${breweries.length} breweries with ${amenityLabel.toLowerCase()} in ${cityName}, Maryland. Explore local taprooms and brewpubs offering ${amenityLabel.toLowerCase()} with detailed hours, locations, and visitor information. Plan your ${cityName} brewery tour today!`
    : `Discover ${cityName}'s craft beer scene. While no breweries currently list ${amenityLabel.toLowerCase()}, check nearby cities for similar options or explore other amenities in ${cityName}, Maryland.`;

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

  // Stats
  const openNow = breweries.filter((b) => isOpenNow(b)).length;
  const stats = [
    { label: 'Total Breweries', value: breweries.length },
    { label: 'Open Today', value: openNow },
    { label: 'In This City', value: cityName },
    { label: 'With This Amenity', value: amenityLabel },
  ];

  // Intro text
  const introText = generateComboIntroText(cityName, amenityLabel, breweries.length);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Cities', url: '/city', isActive: false },
    { name: cityName, url: `/city/${params.city}/breweries`, isActive: false },
    { name: amenityLabel, url: `/city/${params.city}/${params.amenity}`, isActive: true },
  ];

  // Content blocks - simplified for combo pages
  const contentBlocks = [
    {
      title: `About ${amenityLabel} in ${cityName}`,
      content: `${cityName} offers ${breweries.length} breweries with ${amenityLabel.toLowerCase()}, providing convenient options for craft beer enthusiasts seeking this specific amenity. These breweries enhance the local craft beer scene by offering ${amenityLabel.toLowerCase()} alongside quality beer.`
    },
    {
      title: 'What to Expect',
      content: `When visiting ${cityName} breweries with ${amenityLabel.toLowerCase()}, you can expect a welcoming atmosphere that combines craft beer with this popular amenity. Most breweries clearly indicate their ${amenityLabel.toLowerCase()} offerings, making it easy to plan your visit.`
    }
  ];

  // Related pages - optimized for performance
  const cityBreweries = processed.byCity.get(cityName.toLowerCase()) || [];
  const cityBreweryCount = cityBreweries.length;
  
  // Pre-filter breweries with this amenity for efficiency
  const amenityBreweries = processed.breweries.filter((b) => 
    ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey))
  );
  const amenityCount = amenityBreweries.length;
  
  // Nearby cities - limit processing
  const cityToCount = new Map<string, number>();
  for (const b of amenityBreweries) {
    if (b.city.toLowerCase() !== cityName.toLowerCase()) {
      cityToCount.set(b.city, (cityToCount.get(b.city) || 0) + 1);
    }
  }
  const nearby = Array.from(cityToCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([city, count]) => ({
      title: `${city} ${amenityLabel} Breweries`,
      url: `/city/${slugify(city)}/${params.amenity}`,
      count,
    }));

  const relatedPages = [
    { title: `All ${cityName} Breweries`, url: `/city/${params.city}/breweries`, count: cityBreweryCount },
    { title: `${amenityLabel} Breweries (Statewide)`, url: `/amenities/${params.amenity}`, count: amenityCount },
    ...nearby,
  ];

  return (
    <DirectoryPageTemplate
      h1={`${amenityLabel} Breweries in ${cityName}, Maryland`}
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweries as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="amenity"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={11}
    />
  );
}
