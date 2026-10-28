import type { Metadata } from 'next';
import { getIndexableNeighborhoods } from '@/lib/db';
import { neighborhoodPath } from '@/lib/neighborhoods';
import { buildMetadata } from '@/lib/seo/metadata';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GroupedLinks, { groupLinks } from '@/components/listing/GroupedLinks';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Neighborhoods Near Breweries',
  description: 'Every Maryland neighborhood with a brewery within three miles, by city: see the breweries nearby and what else there is to do.',
  path: '/neighborhoods',
});

export default async function NeighborhoodsIndex() {
  const neighborhoods = await getIndexableNeighborhoods();
  const groups = groupLinks(
    neighborhoods,
    (n) => n.city,
    (n) => ({ label: n.name, href: neighborhoodPath(n.slug) })
  );
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-3.5">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Neighborhoods', path: '/neighborhoods' },
          ]}
        />
        <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">Neighborhoods near breweries</h1>
        <p className="m-0 max-w-3xl text-base text-muted">
          {neighborhoods.length} Maryland neighborhoods with a brewery within three miles, in {groups.length} cities and towns.
        </p>
      </header>
      <GroupedLinks groups={groups} />
    </div>
  );
}
