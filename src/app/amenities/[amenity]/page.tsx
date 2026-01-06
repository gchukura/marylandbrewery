import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData, getAllAmenities } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateAmenityIntroText, generateAmenityContentBlocks } from '@/lib/content-generators';

/**
 * Get all unique amenities from the data and generate slugs
 */
async function getAllAmenitySlugs(): Promise<string[]> {
  const amenities = await getAllAmenities();
  return amenities.map(amenity => slugify(amenity));
}

/**
 * Normalize amenity label from slug - handles variations
 */
function normalizeAmenityLabel(slug: string, allAmenities: string[]): string | null {
  const slugLower = slug.toLowerCase();
  
  // Try exact match first
  const exactMatch = allAmenities.find(a => slugify(a).toLowerCase() === slugLower);
  if (exactMatch) return exactMatch.replace(/\bWifi\b/i, 'WiFi');
  
  // Try case-insensitive match
  const caseInsensitiveMatch = allAmenities.find(a => a.toLowerCase() === slugLower);
  if (caseInsensitiveMatch) return caseInsensitiveMatch.replace(/\bWifi\b/i, 'WiFi');
  
  // Try deslugify and match
  const deslugified = deslugify(slug);
  const deslugifiedMatch = allAmenities.find(a => a.toLowerCase() === deslugified.toLowerCase());
  if (deslugifiedMatch) return deslugifiedMatch.replace(/\bWifi\b/i, 'WiFi');
  
  // Try partial match (for cases like "dog-friendly" matching "Dog Friendly")
  const partialMatch = allAmenities.find(a => 
    a.toLowerCase().replace(/\s+/g, '-') === slugLower ||
    slugify(a).toLowerCase() === slugLower
  );
  if (partialMatch) return partialMatch.replace(/\bWifi\b/i, 'WiFi');
  
  return null;
}

export async function generateStaticParams() {
  const amenitySlugs = await getAllAmenitySlugs();
  return amenitySlugs.map((slug) => ({ amenity: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ amenity: string }> }): Promise<Metadata> {
  const { amenity } = await params;
  const processed = await getProcessedBreweryData();
  const allAmenities = processed.amenities;
  
  const normalizedLabel = normalizeAmenityLabel(amenity, allAmenities);
  if (!normalizedLabel) {
    return {
      title: 'Amenity Not Found',
    };
  }
  
  const key = normalizedLabel.toLowerCase();
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );
  const pct = processed.breweries.length > 0 ? Math.round((breweries.length / processed.breweries.length) * 100) : 0;

  const labelLower = normalizedLabel.toLowerCase();
  const title = `${normalizedLabel} Breweries in MD | ${breweries.length}`;
  const description = breweries.length > 0
    ? `${pct}% of Maryland breweries offer ${labelLower}. Explore ${breweries.length} breweries with ${labelLower} across Maryland, including top cities like Baltimore, Annapolis, and Frederick. Find the best ${labelLower} breweries near you with hours, locations, and visitor information.`
    : `Discover Maryland's craft beer scene. While breweries with ${labelLower} aren't listed yet, check other amenities for great craft beer options.`;

  return {
    title,
    description,
    alternates: { canonical: `/amenities/${amenity}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/amenities/${amenity}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${normalizedLabel} Breweries in Maryland`,
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

export default async function AmenityPage({ params }: { params: Promise<{ amenity: string }> }) {
  const { amenity } = await params;
  const processed = await getProcessedBreweryData();
  const allAmenities = processed.amenities;
  
  // Normalize amenity label from slug
  const normalizedLabel = normalizeAmenityLabel(amenity, allAmenities);
  if (!normalizedLabel) {
    notFound();
  }
  
  const key = normalizedLabel.toLowerCase();
  const label = normalizedLabel;

  // Filter efficiently from preprocessed list
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );
  
  // Return 404 if no breweries found
  if (breweries.length === 0) {
    notFound();
  }

  // Compute stats
  const total = breweries.length;
  const pct = processed.breweries.length > 0 ? Math.round((total / processed.breweries.length) * 100) : 0;

  // Top cities for this amenity
  const cityCounts = new Map<string, number>();
  for (const b of breweries) {
    cityCounts.set(b.city, (cityCounts.get(b.city) || 0) + 1);
  }
  const topCitiesData = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  // Most common type with this amenity
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
  const mostCommonType = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Brewpubs';

  // Stats
  const stats = [
    { label: 'With This Amenity', value: total },
    { label: '% of Total', value: `${pct}%` },
    { label: 'Top City', value: topCitiesData[0] ? `${topCitiesData[0].city} (${topCitiesData[0].count})` : 'N/A' },
    { label: 'Most Common Type', value: mostCommonType },
  ];

  // Intro text
  const introText = generateAmenityIntroText(label, total, pct);

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Amenities', url: '/amenities', isActive: false },
    { name: label, url: `/amenities/${amenity}`, isActive: true },
  ];

  // Content blocks
  const contentBlocks = generateAmenityContentBlocks(label, total, pct, topCitiesData);

  // Related pages
  // Top cities with this amenity
  const topCities = topCitiesData.slice(0, 5).map(({ city, count }) => ({
    title: `${city} ${label} Breweries`,
    url: `/cities/${slugify(city)}/${amenity}`,
    count,
  }));

  // Related amenities - get top 4 amenities by count (excluding current amenity)
  const relatedAmenities = allAmenities
    .filter((a) => a.toLowerCase() !== key)
    .map((a) => {
      const aKey = a.toLowerCase();
      const relatedBreweries = processed.breweries.filter(
        (b) => ((b as any).amenities || (b as any).features || []).some((amenity: string) => 
          amenity.toLowerCase().includes(aKey)
        )
      );
      return {
        title: `${a.replace(/\bWifi\b/i, 'WiFi')} Breweries`,
        url: `/amenities/${slugify(a)}`,
        count: relatedBreweries.length,
        amenity: a,
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ title, url, count }) => ({ title, url, count }));

  const relatedPages = [...topCities, ...relatedAmenities];

  return (
    <DirectoryPageTemplate
      h1={`${label} Breweries in Maryland`}
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
      mapZoom={9}
    />
  );
}
