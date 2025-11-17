import { Metadata } from 'next';
import Link from 'next/link';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import GridContainer from '@/components/layout/GridContainer';

export const metadata: Metadata = {
  title: 'Maryland Counties with Breweries - Browse by County',
  description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland. Explore Baltimore City, Anne Arundel, Montgomery, and more.',
  alternates: {
    canonical: '/county',
  },
  openGraph: {
    title: 'Maryland Counties with Breweries - Browse by County',
    description: 'Browse all 24 Maryland counties with breweries. Find breweries by county across Maryland.',
    url: 'https://marylandbrewery.com/county',
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
    county,
    count: processed.breweries.filter(b => (b as any).county?.toLowerCase() === county.toLowerCase()).length,
  }));

  // Simple region grouping
  const REGIONS: Record<string, string[]> = {
    'Western Maryland': ['Allegany', 'Garrett', 'Washington'],
    'Central Maryland': ['Frederick', 'Carroll', 'Howard', 'Montgomery', 'Baltimore', 'Anne Arundel'],
    'Southern Maryland': ['Calvert', 'Charles', 'St Marys'],
    'Eastern Shore': ['Cecil', 'Kent', 'Queen Annes', 'Caroline', 'Talbot', 'Dorchester', 'Wicomico', 'Somerset', 'Worcester'],
  };

  const grouped: Record<string, { county: string; count: number }[]> = {
    'Western Maryland': [],
    'Central Maryland': [],
    'Southern Maryland': [],
    'Eastern Shore': [],
  };

  for (const item of items) {
    const region = Object.entries(REGIONS).find(([_, list]) =>
      list.some(c => c.toLowerCase() === item.county.toLowerCase())
    )?.[0] || 'Central Maryland';
    grouped[region].push(item);
  }

  // Sort by density desc
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => b.count - a.count || a.county.localeCompare(b.county));
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Maryland Counties"
        subtitle="Browse all 24 counties with brewery counts."
      />

      {/* Density map placeholder */}
      <div className="mb-10">
        <div className="rounded-card border bg-white">
          <div className="p-4 border-b font-medium">Brewery Density Map</div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Maryland county map visualization (placeholder)
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([region, list]) => (
          <section key={region}>
            <h3 className="text-h3 font-semibold mb-4">{region}</h3>
            <GridContainer>
              {list.map(({ county, count }) => (
                <Link key={county} href={`/county/${slugify(county)}/breweries`} className="card card-hover flex items-center justify-between">
                  <span className="font-medium text-gray-900">{county} County</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </Link>
              ))}
            </GridContainer>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
