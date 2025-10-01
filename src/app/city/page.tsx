import Link from 'next/link';
import { getAllCities, getProcessedBreweryData } from '../../../lib/brewery-data';
import { slugify } from '@/lib/data-utils';
import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import GridContainer from '@/components/layout/GridContainer';

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
