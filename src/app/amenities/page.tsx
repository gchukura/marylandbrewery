import type { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { AMENITIES, amenityPath, hasAmenity } from '@/lib/amenities';
import { buildMetadata } from '@/lib/seo/metadata';
import PageHeader from '@/components/ui/PageHeader';
import IndexCard, { IndexGrid } from '@/components/ui/IndexCard';

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Breweries by Amenity',
  description:
    'Find Maryland breweries with a full kitchen, outdoor seating, beer to go, parking, tours and more, with how many offer each.',
  path: '/amenities',
});

export const revalidate = 3600;

export default async function AmenitiesIndexPage() {
  const { breweries } = await getProcessedBreweryData();
  const items = AMENITIES.map((def) => ({
    def,
    count: breweries.filter((b) => hasAmenity(b, def)).length,
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Amenities', path: '/amenities' },
        ]}
        title="Breweries by amenity"
        intro="Find a brewery with a kitchen, a patio, beer to go or room for the dog. Counts are how many Maryland breweries we know offer each."
      />
      <IndexGrid>
        {items.map(({ def, count }) => (
          <IndexCard
            key={def.slug}
            href={amenityPath(def)}
            title={def.label}
            count={count}
            description={def.description}
          />
        ))}
      </IndexGrid>
    </div>
  );
}
