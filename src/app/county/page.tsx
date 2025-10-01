import Link from 'next/link';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';

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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Maryland Counties</h1>
      <p className="text-gray-600 mb-8">Browse all 24 counties with brewery counts. Click a county to view breweries and local insights.</p>

      {/* Density map placeholder */}
      <div className="mb-10">
        <div className="rounded-lg border bg-white">
          <div className="p-4 border-b font-medium">Brewery Density Map</div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Maryland county map visualization (placeholder)
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([region, list]) => (
          <section key={region}>
            <h2 className="text-2xl font-semibold mb-4">{region}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {list.map(({ county, count }) => (
                <li key={county} className="border rounded-md p-4 hover:shadow transition">
                  <Link href={`/county/${slugify(county)}/breweries`} className="flex items-center justify-between">
                    <span className="font-medium">{county} County</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
