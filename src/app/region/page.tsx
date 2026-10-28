import type { Metadata } from 'next';
import {
  breweriesInRegion,
  getProcessedBreweryData,
  getRegions,
} from '@/lib/db';
import { buildMetadata } from '@/lib/seo/metadata';
import { countyLabel } from '@/lib/seo/page-meta';
import PageHeader from '@/components/ui/PageHeader';
import IndexCard, { IndexGrid } from '@/components/ui/IndexCard';

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Breweries by Region',
  description:
    'Explore Maryland breweries by region: the Eastern Shore, Western Maryland, Central Maryland, Southern Maryland and the Capital Region.',
  path: '/region',
});

export const revalidate = 3600;

export default async function RegionsIndexPage() {
  const [processed, regions] = await Promise.all([
    getProcessedBreweryData(),
    getRegions(),
  ]);
  const items = regions
    .map((region) => ({
      region,
      count: breweriesInRegion(region, processed.breweries).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Regions', path: '/region' },
        ]}
        title="Breweries by region"
        intro={`Maryland's ${items.length} regions, from the mountains of Western Maryland to the Eastern Shore.`}
      />
      <IndexGrid>
        {items.map(({ region, count }) => (
          <IndexCard
            key={region.slug}
            href={`/region/${region.slug}`}
            title={region.name}
            count={count}
            description={region.description}
            meta={region.counties.map(countyLabel).join(', ')}
          />
        ))}
      </IndexGrid>
    </div>
  );
}
