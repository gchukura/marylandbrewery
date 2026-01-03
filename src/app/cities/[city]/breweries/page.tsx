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
  const breweries = (processed.byCity instanceof Map 
    ? processed.byCity.get(cityName.toLowerCase().trim())
    : (processed.byCity as any)?.[cityName.toLowerCase().trim()]) || [];
  const total = breweries.length;
  const amenityCounts = collectAmenities(breweries);
  const topAmenities = Object.entries(amenityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join(', ');

  // Special SEO optimization for Frederick (400 Traffic Potential - highest opportunity!)
  let title: string;
  let description: string;
  
  if (cityName.toLowerCase() === 'frederick') {
    title = `Breweries in Frederick Maryland | ${total} Local Craft Breweries`;
    description = `Explore ${total} breweries in Frederick, Maryland. Find the best craft beer spots in downtown Frederick and the surrounding area. ${topAmenities ? `Popular features include ${topAmenities}.` : ''} Plan your Frederick brewery tour today!`;
  } else if (cityName.toLowerCase() === 'ocean city') {
    title = `Breweries in Ocean City Maryland | Beach Town Craft Beer Guide`;
    description = `Discover breweries in Ocean City, Maryland and nearby beach towns. Perfect for your next vacation or weekend getaway. Find ${total} craft breweries in the Ocean City area.`;
  } else {
    title = generateCityTitle(cityName, total);
    description = generateCityDescription(cityName, total, topAmenities);
  }

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/${city}/breweries`,
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
  const breweries = (processed.byCity instanceof Map 
    ? processed.byCity.get(cityName.toLowerCase().trim())
    : (processed.byCity as any)?.[cityName.toLowerCase().trim()]) || [];

  // Intro text
  const statsForIntro = { totalBreweries: breweries.length, totalCounties: 0, totalTypes: 0 };
  const introText = generateCityIntroText(cityName, breweries.length, statsForIntro);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Cities', url: '/cities', isActive: false },
    { name: cityName, url: `/cities/${city}/breweries`, isActive: true },
  ];

  // Stats
  const stats = computeCityStats(breweries);

  // Content blocks
  const contentBlocks = generateCityContentBlocks(cityName, breweries);

  // Related pages
  const allCities = await getAllCities();
  const cityCounts = new Map<string, number>();
  processed.breweries.forEach((b: any) => {
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
      url: `/cities/${slugify(city)}/breweries`,
      count: cityCounts.get(city),
    }));

  // Top amenities in this city - now including ALL major amenities for SEO
  const majorAmenities = ['dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'parking', 'tours'];

  const amenityCounts = new Map<string, number>();
  breweries.forEach((b: any) => {
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
        url: `/cities/${city}/${amenitySlug}`,
        count,
      } : null;
    })
    .filter(Boolean) as Array<{title: string; url: string; count: number}>;

  // Brewery types in this city
  const typeCounts = new Map<string, number>();
  breweries.forEach((b: any) => {
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
      url: `/cities/${city}/${slugify(type)}`,
      count: typeCounts.get(type),
    }));

  const relatedPages = [
    ...topCities,
    ...topAmenities,
    ...topTypes,
  ];

  // Special content for Frederick (high-value keyword target)
  let h1Text = `Breweries in ${cityName}, Maryland`;
  if (cityName.toLowerCase() === 'frederick') {
    h1Text = `Breweries in Frederick, Maryland`;
    // Enhance content blocks for Frederick
    contentBlocks.unshift({
      title: "About Frederick's Craft Beer Scene",
      content: `Frederick, Maryland has emerged as one of the state's premier craft beer destinations. With ${breweries.length} breweries, Frederick offers a diverse brewery scene from historic downtown taprooms to modern production facilities. The city's walkable downtown makes it easy to visit multiple breweries in one day, and many breweries feature outdoor patios, live music, and local food options.`,
    });
  } else if (cityName.toLowerCase() === 'ocean city') {
    h1Text = `Breweries in Ocean City, Maryland`;
    // Enhance content blocks for Ocean City
    contentBlocks.unshift({
      title: "Ocean City Breweries & Beach Town Craft Beer",
      content: `Discover craft breweries in Ocean City, Maryland and the surrounding beach communities. While Ocean City itself may have limited brewery options, nearby towns like Berlin and Bishopville offer excellent craft beer experiences. Many breweries in the area cater to vacationers and feature seasonal hours, outdoor seating, and beach-friendly atmospheres.`,
    });
  }

  return (
    <DirectoryPageTemplate
      h1={h1Text}
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
