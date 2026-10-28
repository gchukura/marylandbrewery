import { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';
import { isOpenAt } from '@/lib/hours';
import { slugify } from '@/lib/slug';

export const revalidate = 3600; // ISR hourly

export const metadata: Metadata = {
  title: 'Breweries Open Now - Maryland Brewery Directory',
  description: 'Find Maryland breweries currently open right now. Real-time list of breweries open across the state with current hours and closing times. Updated hourly. Plan your visit to open taprooms, brewpubs, and craft breweries near you.',
  alternates: {
    canonical: '/open-now',
  },
  openGraph: {
    title: 'Breweries Open Now - Maryland Brewery Directory',
    description: 'Find Maryland breweries currently open. Real-time list of breweries open now across the state.',
    url: 'https://www.marylandbrewery.com/open-now',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Open Now',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breweries Open Now - Maryland Brewery Directory',
    description: 'Find Maryland breweries currently open. Real-time list of breweries open now across the state.',
    images: ['/opengraph-image'],
  },
};

export default async function OpenNowPage() {
  const processed = await getProcessedBreweryData();
  const openBreweries = processed.breweries
    .map(b => ({ b, status: isOpenAt(b.hours) }))
    .filter(x => x.status.open)
    .map(x => ({ ...x.b, closeTime: x.status.closesAt }));

  // Group by city
  const byCity = new Map<string, any[]>();
  for (const b of openBreweries) {
    if (!byCity.has(b.city)) byCity.set(b.city, []);
    byCity.get(b.city)!.push(b);
  }
  const groups = Array.from(byCity.entries()).sort((a,b) => a[0].localeCompare(b[0]));

  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Open Now', url: '/open-now', isActive: true },
  ];

  // Related pages for internal linking
  const relatedPages = [
    { title: 'Interactive Map', url: '/map', count: processed.breweries.length },
    { title: 'All Cities', url: '/cities', count: processed.cities.length },
    { title: 'Browse by Amenity', url: '/amenities', count: 0 },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Breweries Open Now"
        introText="Find Maryland breweries currently open right now. Real-time list of breweries open across the state with current hours and closing times. Updated hourly."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="container mx-auto px-4 py-10">

      {groups.length === 0 && (
        <div className="text-gray-600">No breweries are currently open.</div>
      )}

      <div className="space-y-10">
        {groups.map(([city, list]) => (
          <section key={city}>
            <h2 className="text-2xl font-semibold mb-4">{city}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((b) => (
                <li key={b.id} className="border rounded-md p-4">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-sm text-gray-600">{b.city}, {b.state}</div>
                  {b.closeTime && (
                    <div className="text-sm text-green-700 mt-1">Open until {b.closeTime}</div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Related Links Section */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-200 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {relatedPages.map((page) => (
            <Link
              key={page.url}
              href={page.url}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-500 hover:shadow-md transition-all"
            >
              <div className="font-semibold text-gray-900">{page.title}</div>
              {page.count > 0 && (
                <div className="text-sm text-gray-600 mt-1">{page.count} {page.count === 1 ? 'brewery' : 'breweries'}</div>
              )}
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
