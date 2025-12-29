import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';
import { slugify } from '@/lib/data-utils';

export const revalidate = 3600; // ISR hourly

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const;

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day: dayParam } = await params;
  const day = dayParam.charAt(0).toUpperCase() + dayParam.slice(1);
  const processed = await getProcessedBreweryData();
  const list = processed.breweries.filter((b) => {
    const hours = b.hours as any;
    if (!hours) return false;
    const h = hours[dayParam.toLowerCase() as keyof typeof hours];
    if (!h || /closed/i.test(h)) return false;
    return true;
  });

  return {
    title: `Breweries Open on ${day} - Maryland Brewery Directory`,
    description: `Find ${list.length} Maryland breweries open on ${day}s. Complete list of craft breweries, taprooms, and brewpubs with hours for ${day}. Plan your ${day} brewery tour across Baltimore, Annapolis, Frederick, and more cities.`,
    alternates: {
      canonical: `/open/${dayParam}`,
    },
    openGraph: {
      title: `Breweries Open on ${day} - Maryland Brewery Directory`,
      description: `Find ${list.length} Maryland breweries open on ${day}. Complete list of breweries with hours for ${day}.`,
      url: `https://www.marylandbrewery.com/open/${dayParam}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Maryland Brewery Directory - Open on ${day}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Breweries Open on ${day} - Maryland Brewery Directory`,
      description: `Find ${list.length} Maryland breweries open on ${day}. Complete list of breweries with hours for ${day}.`,
      images: ['/og-image.jpg'],
    },
  };
}

export async function generateStaticParams() {
  return DAYS.map((d) => ({ day: d }));
}

function isOpenOnDay(hours?: Record<string, string>, day?: string) {
  if (!hours || !day) return false;
  const h = hours[day as keyof typeof hours];
  if (!h || /closed/i.test(h)) return false;
  return true;
}

export default async function OpenDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayParam } = await params;
  const day = (dayParam || '').toLowerCase();
  const processed = await getProcessedBreweryData();
  const list = processed.breweries.filter((b) => isOpenOnDay(b.hours as any, day));

  const groups = new Map<string, any[]>();
  for (const b of list) {
    if (!groups.has(b.city)) groups.set(b.city, []);
    groups.get(b.city)!.push(b);
  }
  const sorted = Array.from(groups.entries()).sort((a,b) => a[0].localeCompare(b[0]));

  const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Open Now', url: '/open-now', isActive: false },
    { name: `Open on ${dayCapitalized}`, url: `/open/${dayParam}`, isActive: true },
  ];

  // Related pages for internal linking
  const relatedPages = [
    { title: 'Open Now', url: '/open-now', count: processed.breweries.length },
    { title: 'Interactive Map', url: '/map', count: processed.breweries.length },
    { title: 'All Cities', url: '/city', count: processed.cities.length },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1={`Breweries Open on ${dayCapitalized}`}
        introText={`Find ${list.length} Maryland breweries open on ${dayCapitalized}s. Complete list of craft breweries, taprooms, and brewpubs with hours for ${dayCapitalized}. Plan your ${dayCapitalized} brewery tour across Baltimore, Annapolis, Frederick, and more cities.`}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-4 py-10">

      {sorted.length === 0 && (
        <div className="text-gray-600">No breweries listed as open on this day.</div>
      )}

      <div className="space-y-10">
        {sorted.map(([city, items]) => (
          <section key={city}>
            <h2 className="text-2xl font-semibold mb-4">{city}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((b) => (
                <li key={b.id} className="border rounded-md p-4">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-sm text-gray-600">{b.city}, {b.state}</div>
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
