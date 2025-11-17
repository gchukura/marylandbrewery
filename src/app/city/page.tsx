import { Metadata } from 'next';
import { getAllCities, getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import IndexPageTemplate from '@/components/directory/IndexPageTemplate';

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
    name: city,
    slug: slugify(city),
    count: processed.byCity.get(city.toLowerCase().trim())?.length || 0,
    url: `/city/${slugify(city)}/breweries`,
  })).filter(item => item.count > 0);

  // Group by regions
  const grouped: Record<string, typeof items> = {
    'Western Maryland': [],
    'Central Maryland': [],
    'Eastern Shore': [],
    'Other': [],
  };

  for (const item of items) {
    const region = Object.entries(REGIONS).find(([_, list]) =>
      list.some((c) => c.toLowerCase() === item.name.toLowerCase())
    )?.[0] || 'Other';
    grouped[region].push(item);
  }

  // Sort each region by count desc, then name asc
  for (const region of Object.keys(grouped)) {
    grouped[region].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) delete grouped[key];
  });

  // Stats
  const totalBreweries = processed.breweries.length;
  const totalCities = items.length;
  const avgPerCity = totalCities > 0 ? Math.round(totalBreweries / totalCities) : 0;
  const topCity = items.sort((a, b) => b.count - a.count)[0];

  const stats = [
    { label: 'Total Cities', value: totalCities },
    { label: 'Total Breweries', value: totalBreweries },
    { label: 'Avg per City', value: avgPerCity },
    { label: 'Top City', value: topCity ? `${topCity.name} (${topCity.count})` : 'N/A' },
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Cities', url: '/city', isActive: true },
  ];

  return (
    <IndexPageTemplate
      h1="Maryland Cities with Breweries"
      introText="Browse all cities in Maryland with craft breweries. From Baltimore's historic neighborhoods to Annapolis' waterfront locations, discover breweries across the Old Line State organized by region."
      breadcrumbs={breadcrumbs}
      items={items}
      stats={stats}
      groupedItems={grouped}
      allBreweries={processed.breweries as any}
      pageType="city"
      showMap={true}
      showStats={true}
      mapZoom={9}
    />
  );
}
