import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';

export const metadata: Metadata = {
  title: 'Maryland Counties with Breweries - Browse by County',
  description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland. Explore Baltimore City, Anne Arundel, Montgomery, and more.',
  alternates: {
    canonical: '/county',
  },
  openGraph: {
    title: 'Maryland Counties with Breweries - Browse by County',
    description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland.',
    url: 'https://www.marylandbrewery.com/county',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Counties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Counties with Breweries - Browse by County',
    description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland.',
    images: ['/og-image.jpg'],
  },
};

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

export const revalidate = 3600;

export default async function CountiesIndexPage() {
  const processed = await getProcessedBreweryData();

  const items = ALL_MD_COUNTIES.map((county) => ({
    name: `${county} County`,
    slug: slugify(county),
    count: processed.breweries.filter(b => (b as any).county?.toLowerCase() === county.toLowerCase()).length,
    url: `/county/${slugify(county)}/breweries`,
  }));

  // Region grouping
  const REGIONS: Record<string, string[]> = {
    'Western Maryland': ['Allegany', 'Garrett', 'Washington'],
    'Central Maryland': ['Frederick', 'Carroll', 'Howard', 'Montgomery', 'Baltimore', 'Anne Arundel'],
    'Southern Maryland': ['Calvert', 'Charles', 'St Marys'],
    'Eastern Shore': ['Cecil', 'Kent', 'Queen Annes', 'Caroline', 'Talbot', 'Dorchester', 'Wicomico', 'Somerset', 'Worcester'],
  };

  const grouped: Record<string, typeof items> = {
    'Western Maryland': [],
    'Central Maryland': [],
    'Southern Maryland': [],
    'Eastern Shore': [],
  };

  for (const item of items) {
    const countyName = item.name.replace(' County', '');
    const region = Object.entries(REGIONS).find(([_, list]) =>
      list.some(c => c.toLowerCase() === countyName.toLowerCase())
    )?.[0] || 'Central Maryland';
    grouped[region].push(item);
  }

  // Sort by count desc
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  // Stats
  const totalBreweries = processed.breweries.length;
  const countiesWithBreweries = items.filter(i => i.count > 0).length;
  const avgPerCounty = countiesWithBreweries > 0 ? Math.round(totalBreweries / countiesWithBreweries) : 0;
  const topCounty = items.sort((a, b) => b.count - a.count)[0];

  const stats = [
    { label: 'Counties with Breweries', value: countiesWithBreweries },
    { label: 'Total Breweries', value: totalBreweries },
    { label: 'Avg per County', value: avgPerCounty },
    { label: 'Top County', value: topCounty ? `${topCounty.name.replace(' County', '')} (${topCounty.count})` : 'N/A' },
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Counties', url: '/county', isActive: true },
  ];

  return (
    <IndexPageTemplate
      h1="Maryland Counties with Breweries"
      introText="Browse all 24 Maryland counties with craft breweries. From urban centers like Baltimore City and Montgomery County to rural areas across the state, discover how craft beer has spread throughout Maryland's diverse regions."
      breadcrumbs={breadcrumbs}
      items={items}
      stats={stats}
      groupedItems={grouped}
      allBreweries={processed.breweries as any}
      pageType="county"
      showMap={true}
      showStats={true}
      mapZoom={8}
    />
  );
}
