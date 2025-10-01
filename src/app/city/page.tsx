import Link from 'next/link';
import { getAllCities, getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';

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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Maryland Cities with Breweries</h1>
      <p className="text-gray-600 mb-8">Browse all cities in Maryland with breweries. Click a city to see all breweries in that area.</p>

      <div className="space-y-10">
        {Object.entries(grouped).map(([region, list]) => (
          <section key={region}>
            <h2 className="text-2xl font-semibold mb-4">{region}</h2>
            {list.length === 0 ? (
              <p className="text-gray-500">No cities in this region.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map(({ city, count }) => (
                  <li key={city} className="border rounded-md p-4 hover:shadow transition">
                    <Link href={`/city/${slugify(city)}/breweries`} className="flex items-center justify-between">
                      <span className="font-medium">{city}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
