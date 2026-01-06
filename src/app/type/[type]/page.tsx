import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';
import { getProcessedBreweryData, getAllTypes } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateTypeContentBlocks } from '@/lib/content-generators';

/**
 * Get all unique brewery types from the data and generate slugs
 */
async function getAllTypeSlugs(): Promise<string[]> {
  const types = await getAllTypes();
  return types.map(type => slugify(type));
}

/**
 * Normalize type name from slug - handles variations
 */
function normalizeTypeName(slug: string, allTypes: string[]): string | null {
  const slugLower = slug.toLowerCase();
  
  // Try exact match first
  const exactMatch = allTypes.find(t => slugify(t).toLowerCase() === slugLower);
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const caseInsensitiveMatch = allTypes.find(t => t.toLowerCase() === slugLower);
  if (caseInsensitiveMatch) return caseInsensitiveMatch;
  
  // Try deslugify and match
  const deslugified = deslugify(slug);
  const deslugifiedMatch = allTypes.find(t => t.toLowerCase() === deslugified.toLowerCase());
  if (deslugifiedMatch) return deslugifiedMatch;
  
  return null;
}

export async function generateStaticParams() {
  const typeSlugs = await getAllTypeSlugs();
  return typeSlugs.map((slug) => ({ type: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const processed = await getProcessedBreweryData();
  const allTypes = processed.types;
  
  const normalizedType = normalizeTypeName(type, allTypes);
  if (!normalizedType) {
    return {
      title: 'Brewery Type Not Found',
    };
  }
  
  const typeKey = normalizedType.toLowerCase();
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(t => t.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  
  const typeLabel = normalizedType;
  const typeLabelLower = typeLabel.toLowerCase();
  const title = `${typeLabel} Breweries in MD | ${breweries.length}`;
  const description = breweries.length > 0
    ? `Explore ${breweries.length} ${typeLabelLower} breweries across Maryland. Find top ${typeLabelLower} breweries in Baltimore, Annapolis, Frederick, and other cities. Complete guide to ${typeLabelLower} breweries in the Old Line State with hours, amenities, and visitor information.`
    : `Discover Maryland's craft beer scene. While ${typeLabelLower} breweries aren't listed yet, check other brewery types for great craft beer options.`;
  
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
  const allTypes = processed.types;
  
  // Normalize type name from slug
  const normalizedType = normalizeTypeName(type, allTypes);
  if (!normalizedType) {
    notFound();
  }
  
  const typeKey = normalizedType.toLowerCase();
  const typeLabel = normalizedType;
  
  // Filter breweries by type
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(t => t.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  
  // Return 404 if no breweries found
  if (breweries.length === 0) {
    notFound();
  }

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
    { name: 'Maryland Breweries', url: '/', isActive: false },
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

  // Other types - get top 3 types by count (excluding current type)
  const otherTypes = allTypes
    .filter((t) => t.toLowerCase() !== typeKey)
    .map((t) => {
      const tKey = t.toLowerCase();
      const typeBreweries = processed.breweries.filter((b) => {
        if (Array.isArray(b.type)) {
          return b.type.some(bt => bt.toLowerCase() === tKey);
        }
        return b.type?.toLowerCase() === tKey;
      });
      return {
        title: `${t} Breweries`,
        url: `/type/${slugify(t)}`,
        count: typeBreweries.length,
        type: t,
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(({ title, url, count }) => ({ title, url, count }));

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
