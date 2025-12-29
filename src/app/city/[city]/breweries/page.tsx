import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getAllCities, getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify, isOpenNow } from '@/lib/data-utils';
import { generateCityIntroText, generateCityContentBlocks } from '@/lib/content-generators';
import { generateCityTitle, generateCityDescription } from '@/lib/seo-utils';

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

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = deslugify(city);
  const processed = await getProcessedBreweryData();
  const breweries = processed.byCity.get(cityName.toLowerCase().trim()) || [];
  const total = breweries.length;
  const amenityCounts = collectAmenities(breweries);
  const topAmenities = Object.entries(amenityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join(', ');

  const title = generateCityTitle(cityName, total);
  const description = generateCityDescription(cityName, total, topAmenities);

  return {
    title,
    description,
    alternates: { canonical: `/city/${city}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/city/${city}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${cityName} Breweries`,
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

function computeCityStats(breweries: any[]) {
  const total = breweries.length;
  const openNow = breweries.filter((b) => isOpenNow(b)).length;
  const dogFriendly = breweries.filter((b) =>
    ((b as any).amenities || b.features || []).some((a: string) => /dog|pet/i.test(a))
  ).length;
  const withFood = breweries.filter((b) =>
    ((b as any).amenities || b.features || []).some((a: string) => /food|kitchen|restaurant/i.test(a))
  ).length;

  return [
    { label: 'Total Breweries', value: total },
    { label: 'Open Today', value: openNow },
    { label: 'Dog-Friendly', value: dogFriendly },
    { label: 'With Food', value: withFood },
  ];
}

export default async function CityBreweriesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = deslugify(city);
  const processed = await getProcessedBreweryData();
  const breweries = processed.byCity.get(cityName.toLowerCase().trim()) || [];

  // Intro text
  const statsForIntro = { totalBreweries: breweries.length, totalCounties: 0, totalTypes: 0 };
  const introText = generateCityIntroText(cityName, breweries.length, statsForIntro);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Cities', url: '/city', isActive: false },
    { name: cityName, url: `/city/${city}/breweries`, isActive: true },
  ];

  // Stats
  const stats = computeCityStats(breweries);

  // Content blocks
  const contentBlocks = generateCityContentBlocks(cityName, breweries);

  // Related pages
  const allCities = await getAllCities();
  const cityCounts = new Map<string, number>();
  processed.breweries.forEach(b => {
    if (b.city && b.city.toLowerCase() !== cityName.toLowerCase()) {
      const city = b.city.toLowerCase().trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([city]) => ({
      title: `${city.charAt(0).toUpperCase() + city.slice(1)} Breweries`,
      url: `/city/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  // Top amenities in this city - now including ALL major amenities for SEO
  const majorAmenities = ['dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'parking', 'tours'];

  const amenityCounts = new Map<string, number>();
  breweries.forEach(b => {
    const amenities = (b as any).amenities || (b as any).features || [];
    amenities.forEach((a: string) => {
      const key = a.trim().toLowerCase();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });

  // Generate links for ALL major amenities (not just top 3) to fix orphan pages
  const topAmenities = majorAmenities
    .map(amenitySlug => {
      const amenityKey = amenitySlug.replace(/-/g, ' ');
      const count = Array.from(amenityCounts.entries())
        .filter(([key]) => key.includes(amenityKey))
        .reduce((sum, [,val]) => sum + val, 0);

      return count > 0 ? {
        title: `${cityName} ${amenityKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Breweries`,
        url: `/city/${city}/${amenitySlug}`,
        count,
      } : null;
    })
    .filter(Boolean) as Array<{title: string; url: string; count: number}>;

  // Brewery types in this city
  const typeCounts = new Map<string, number>();
  breweries.forEach(b => {
    const types = Array.isArray(b.type) ? b.type : [b.type];
    types.forEach((type: string) => {
      if (type) {
        const key = type.toLowerCase();
        typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
      }
    });
  });
  
  const topTypes = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => ({
      title: `${cityName} ${type.charAt(0).toUpperCase() + type.slice(1)} Breweries`,
      url: `/city/${city}/${slugify(type)}`,
      count: typeCounts.get(type),
    }));

  const relatedPages = [
    ...topCities,
    ...topAmenities,
    ...topTypes,
  ];

  return (
    <DirectoryPageTemplate
      h1={`Breweries in ${cityName}, Maryland`}
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweries as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="city"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={11}
    />
  );
}
