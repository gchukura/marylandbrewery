import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateAmenityIntroText, generateAmenityContentBlocks } from '@/lib/content-generators';

const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function normalizeAmenityLabel(slug: string): string {
  return deslugify(slug).replace(/\bWifi\b/i, 'WiFi');
}

export async function generateStaticParams() {
  return AMENITY_SLUGS.map((a) => ({ amenity: a }));
}

export async function generateMetadata({ params }: { params: Promise<{ amenity: string }> }): Promise<Metadata> {
  const { amenity } = await params;
  const processed = await getProcessedBreweryData();
  const label = normalizeAmenityLabel(amenity);
  const key = label.toLowerCase();
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );
  const pct = processed.breweries.length > 0 ? Math.round((breweries.length / processed.breweries.length) * 100) : 0;

  const labelLower = label.toLowerCase();
  const title = `${label} Breweries in MD | ${breweries.length}`;
  const description = `${pct}% of Maryland breweries offer ${labelLower}. Explore ${breweries.length} breweries with ${labelLower} across Maryland, including top cities like Baltimore, Annapolis, and Frederick. Find the best ${labelLower} breweries near you with hours, locations, and visitor information.`;

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
          alt: `${label} Breweries in Maryland`,
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
  const label = normalizeAmenityLabel(amenity);
  const key = label.toLowerCase();

  // Filter efficiently from preprocessed list
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(key))
  );

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
    { name: 'Home', url: '/', isActive: false },
    { name: 'Amenities', url: '/amenities', isActive: false },
    { name: label, url: `/amenities/${amenity}`, isActive: true },
  ];

  // Content blocks
  const contentBlocks = generateAmenityContentBlocks(label, total, pct, topCitiesData);

  // Related pages
  // Top cities with this amenity
  const topCities = topCitiesData.slice(0, 5).map(({ city, count }) => ({
    title: `${city} ${label} Breweries`,
    url: `/city/${slugify(city)}/${amenity}`,
    count,
  }));

  // Related amenities
  const relatedAmenities = AMENITY_SLUGS.filter((a) => a !== amenity)
    .slice(0, 4)
    .map((a) => {
      const relatedBreweries = processed.breweries.filter(
        (b) => ((b as any).amenities || (b as any).features || []).some((amenity: string) => 
          amenity.toLowerCase().includes(normalizeAmenityLabel(a).toLowerCase())
        )
      );
      return {
        title: `${normalizeAmenityLabel(a)} Breweries`,
        url: `/amenities/${a}`,
        count: relatedBreweries.length,
      };
    });

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
