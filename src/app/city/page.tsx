import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCities, getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import GridContainer from '@/components/layout/GridContainer';
import GoogleMap from '@/components/maps/GoogleMap';
import StatsBar from '@/components/home/StatsBar';

export const metadata: Metadata = {
  title: 'Maryland Cities with Breweries - Browse by City',
  description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State. Explore Baltimore, Annapolis, Frederick, and more.',
  alternates: {
    canonical: '/city',
  },
  openGraph: {
    title: 'Maryland Cities with Breweries - Browse by City',
    description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State.',
    url: 'https://www.marylandbrewery.com/city',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Cities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Cities with Breweries - Browse by City',
    description: 'Browse all Maryland cities with breweries. Find breweries by city across the Old Line State.',
    images: ['/og-image.jpg'],
  },
};

const REGIONS: Record<string, string[]> = {
  'Western Maryland': ['Cumberland', 'Hagerstown', 'Frederick'],
  'Central Maryland': ['Baltimore', 'Columbia', 'Annapolis', 'Towson'],
  'Eastern Shore': ['Salisbury', 'Easton', 'Ocean City', 'Chestertown'],
};

export const revalidate = 3600; // refresh hourly

export default async function CitiesIndexPage() {
  const cities = await getAllCities();
  const processed = await getProcessedBreweryData();
  const items = cities.map((city) => ({
    city,
    count: processed.byCity.get(city.toLowerCase().trim())?.length || 0,
  }));

  // Group by regions with fallback "Other"
  const grouped: Record<string, { city: string; count: number }[]> = {
    'Western Maryland': [],
    'Central Maryland': [],
    'Eastern Shore': [],
    Other: [],
  };

  for (const item of items) {
    const region = Object.entries(REGIONS).find(([_, list]) =>
      list.some((c) => c.toLowerCase() === item.city.toLowerCase())
    )?.[0] || 'Other';
    grouped[region].push(item);
  }

  // Sort each region by count desc, then city asc
  for (const region of Object.keys(grouped)) {
    grouped[region].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Maryland Cities with Breweries"
        subtitle="Browse all cities in Maryland with brewery counts."
      />

      {/* Statewide stats to mirror homepage counter */}
      <StatsBar />

      {/* Interactive Map mirroring homepage styling */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Map</h3>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
              <GoogleMap breweries={processed.breweries as any} height="100%" showClusters={true} zoom={10} />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        {Object.entries(grouped).map(([region, list]) => (
          <section key={region}>
            <h3 className="text-h3 font-semibold mb-4">{region}</h3>
            {list.length === 0 ? (
              <p className="text-gray-500">No cities in this region.</p>
            ) : (
              <GridContainer>
                {list.map(({ city, count }) => (
                  <Link key={city} href={`/city/${slugify(city)}/breweries`} className="card card-hover flex items-center justify-between">
                    <span className="font-medium text-gray-900">{city}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </Link>
                ))}
              </GridContainer>
            )}
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
