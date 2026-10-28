import type { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { countyLabel } from '@/lib/seo/page-meta';
import PageHeader from '@/components/ui/PageHeader';
import IndexCard, { IndexGrid } from '@/components/ui/IndexCard';

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Breweries by County',
  description:
    'Browse Maryland craft breweries county by county, with brewery counts, maps and the towns in each county.',
  path: '/counties',
});

export const revalidate = 3600;

export default async function CountiesIndexPage() {
  const { breweries } = await getProcessedBreweryData();

  const counties = new Map<string, Map<string, number>>();
  for (const b of breweries) {
    if (!b.county) continue;
    const cities = counties.get(b.county) ?? new Map<string, number>();
    if (b.city) cities.set(b.city, (cities.get(b.city) ?? 0) + 1);
    counties.set(b.county, cities);
  }
  const items = [...counties.entries()]
    .map(([county, cities]) => ({
      county,
      count: [...cities.values()].reduce((sum, n) => sum + n, 0),
      // Its towns, most breweries first
      towns: [...cities.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([city]) => city),
    }))
    .sort((a, b) => a.county.localeCompare(b.county));

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Counties', path: '/counties' },
        ]}
        title="Breweries by county"
        intro={`${items.reduce((sum, c) => sum + c.count, 0)} breweries in ${items.length} Maryland counties, with the towns in each.`}
      />
      <IndexGrid>
        {items.map((c) => (
          <IndexCard
            key={c.county}
            href={`/counties/${slugify(c.county)}/breweries`}
            title={countyLabel(c.county)}
            count={c.count}
            meta={
              c.towns.slice(0, 4).join(', ') +
              (c.towns.length > 4 ? `, and ${c.towns.length - 4} more` : '')
            }
          />
        ))}
      </IndexGrid>
    </div>
  );
}
