import { Metadata } from 'next';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateTypeContentBlocks } from '@/lib/content-generators';

const TYPES = ['microbrewery', 'brewpub', 'taproom', 'production', 'nano', 'farm-brewery'] as const;

export async function generateStaticParams() {
  return TYPES.map((t) => ({ type: t }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const processed = await getProcessedBreweryData();
  const typeKey = type.toLowerCase();
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(type => type.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  const typeLabel = deslugify(type);
  const typeLabelLower = typeLabel.toLowerCase();
  const title = `${typeLabel} Breweries in MD | ${breweries.length}`;
  const description = `Explore ${breweries.length} ${typeLabelLower} breweries across Maryland. Find top ${typeLabelLower} breweries in Baltimore, Annapolis, Frederick, and other cities. Complete guide to ${typeLabelLower} breweries in the Old Line State with hours, amenities, and visitor information.`;
  return {
    title,
    description,
    alternates: { canonical: `/type/${type}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/type/${type}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${typeLabel} Breweries in Maryland`,
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

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const processed = await getProcessedBreweryData();
  const typeKey = type.toLowerCase();
  const typeLabel = deslugify(type);
  
  // Special handling for farm-brewery (may not be in type field, check name/description)
  const breweries = processed.breweries.filter((b) => {
    if (typeKey === 'farm-brewery' || typeKey === 'farm brewery') {
      // Check if brewery name or description contains "farm"
      const nameMatch = b.name?.toLowerCase().includes('farm');
      const descMatch = b.description?.toLowerCase().includes('farm');
      const typeMatch = Array.isArray(b.type) 
        ? b.type.some(t => t.toLowerCase().includes('farm'))
        : b.type?.toLowerCase().includes('farm');
      return nameMatch || descMatch || typeMatch;
    }
    
    // Standard type matching
    if (Array.isArray(b.type)) {
      return b.type.some(type => type.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });

  // Top cities by this type
  const cityCounts = new Map<string, number>();
  for (const b of breweries) {
    cityCounts.set(b.city, (cityCounts.get(b.city) || 0) + 1);
  }
  const topCitiesData = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  // Most popular amenity for this type
  const amenityCounts = new Map<string, number>();
  breweries.forEach(b => {
    const amenities = (b as any).amenities || (b as any).features || [];
    amenities.forEach((a: string) => {
      const key = a.trim();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });
  });
  const mostPopularAmenity = Array.from(amenityCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food';

  const percentage = processed.breweries.length > 0 
    ? Math.round((breweries.length / processed.breweries.length) * 100) 
    : 0;

  // Stats
  const stats = [
    { label: 'Total of Type', value: breweries.length },
    { label: '% of All', value: `${percentage}%` },
    { label: 'Largest City', value: topCitiesData[0] ? `${topCitiesData[0].city} (${topCitiesData[0].count})` : 'N/A' },
    { label: 'Most Popular Amenity', value: mostPopularAmenity },
  ];

  // Intro text
  const introText = breweries.length > 0
    ? `Maryland has ${breweries.length} ${typeLabel.toLowerCase()} breweries, representing ${percentage}% of the state's total breweries. With strong presence in ${topCitiesData.slice(0, 3).map(c => c.city).join(', ')}, these breweries showcase the diversity and quality of ${typeLabel.toLowerCase()} brewing across the Old Line State.`
    : `No ${typeLabel.toLowerCase()} breweries listed yet. Check back soon.`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Types', url: '/type', isActive: false },
    { name: typeLabel, url: `/type/${type}`, isActive: true },
  ];

  // Content blocks
  const contentBlocks = generateTypeContentBlocks(typeLabel, breweries.length, percentage, topCitiesData);

  // Related pages
  // Top cities for this type
  const topCities = topCitiesData.slice(0, 5).map(({ city, count }) => ({
    title: `${city} ${typeLabel} Breweries`,
    url: `/cities/${slugify(city)}/breweries`,
    count,
  }));

  // Other types
  const otherTypes = TYPES.filter((t) => t !== type)
    .slice(0, 3)
    .map((t) => {
      const typeBreweries = processed.breweries.filter((b) => {
        if (Array.isArray(b.type)) {
          return b.type.some(type => type.toLowerCase() === t);
        }
        return b.type?.toLowerCase() === t;
      });
      return {
        title: `${deslugify(t)} Breweries`,
        url: `/type/${t}`,
        count: typeBreweries.length,
      };
    });

  const relatedPages = [...topCities, ...otherTypes];

  return (
    <DirectoryPageTemplate
      h1={`${typeLabel} Breweries in Maryland`}
      introText={introText}
      breadcrumbs={breadcrumbs}
      breweries={breweries as any}
      stats={stats}
      contentBlocks={contentBlocks}
      relatedPages={relatedPages}
      pageType="type"
      showMap={true}
      showStats={true}
      showTable={true}
      mapZoom={9}
    />
  );
}
