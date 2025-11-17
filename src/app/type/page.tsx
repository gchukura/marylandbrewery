import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';

export const metadata: Metadata = {
  title: 'Brewery Types - Maryland Brewery Directory',
  description: 'Browse Maryland breweries by type. Explore microbreweries, brewpubs, taprooms, production facilities, and nano breweries across the state.',
  alternates: {
    canonical: '/type',
  },
  openGraph: {
    title: 'Brewery Types - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by type. Explore microbreweries, brewpubs, taprooms, and more.',
    url: 'https://www.marylandbrewery.com/type',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Brewery Types',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brewery Types - Maryland Brewery Directory',
    description: 'Browse Maryland breweries by type.',
    images: ['/og-image.jpg'],
  },
};

const TYPES = ['microbrewery', 'brewpub', 'taproom', 'production', 'nano'] as const;

export const revalidate = 3600;

export default async function TypesIndexPage() {
  const processed = await getProcessedBreweryData();

  // Calculate counts for each type
  const items = TYPES.map((type) => {
    const breweries = processed.breweries.filter((b) => {
      if (Array.isArray(b.type)) {
        return b.type.some(t => t.toLowerCase() === type);
      }
      return b.type?.toLowerCase() === type;
    });
    
    return {
      name: deslugify(type),
      slug: type,
      count: breweries.length,
      url: `/type/${type}`,
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Group by category
  const grouped: Record<string, typeof items> = {
    'Most Common': items.slice(0, 2),
    'Other Types': items.slice(2),
  };

  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) delete grouped[key];
  });

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalTypes = items.length;
  const mostCommon = items[0];
  const percentage = mostCommon && totalBreweries > 0 
    ? Math.round((mostCommon.count / totalBreweries) * 100) 
    : 0;

  const stats = [
    { label: 'Brewery Types', value: totalTypes },
    { label: 'Total Breweries', value: totalBreweries },
    { label: 'Most Common', value: mostCommon ? `${mostCommon.name} (${mostCommon.count})` : 'N/A' },
    { label: 'Market Share', value: mostCommon ? `${percentage}%` : 'N/A' },
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Types', url: '/type', isActive: true },
  ];

  return (
    <IndexPageTemplate
      h1="Brewery Types in Maryland"
      introText="Browse Maryland breweries by their type and business model. From small-batch microbreweries to full-service brewpubs, production facilities, and intimate taprooms, discover the diverse range of brewery types across the Old Line State. Each type offers a unique experience, from traditional brewing operations to modern tasting rooms."
      breadcrumbs={breadcrumbs}
      items={items}
      stats={stats}
      groupedItems={grouped}
      allBreweries={processed.breweries as any}
      pageType="type"
      showMap={true}
      showStats={true}
      mapZoom={9}
    />
  );
}

