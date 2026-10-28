import type { Metadata } from 'next';
import { getIndexableAttractions } from '@/lib/db';
import { buildMetadata } from '@/lib/seo/metadata';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import GroupedLinks, { groupLinks } from '@/components/listing/GroupedLinks';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Things to Do Near Maryland Breweries',
  description: 'Parks, museums, landmarks and more within three miles of a Maryland brewery, by city, each with the breweries closest to it.',
  path: '/near',
});

export default async function AttractionsIndex() {
  const attractions = await getIndexableAttractions();
  const groups = groupLinks(
    attractions,
    (a) => a.city,
    (a) => ({ label: a.name, href: `/near/${a.slug}` })
  );
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-3.5">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Things to do', path: '/near' },
          ]}
        />
        <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">Things to do near breweries</h1>
        <p className="m-0 max-w-3xl text-base text-muted">
          {attractions.length} parks, museums, landmarks and more within three miles of a Maryland brewery, in {groups.length} cities and towns.
        </p>
      </header>
      <GroupedLinks groups={groups} />
    </div>
  );
}
