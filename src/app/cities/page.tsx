import type { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import { buildMetadata } from '@/lib/seo/metadata';
import { countyLabel } from '@/lib/seo/page-meta';
import { slugify } from '@/lib/slug';
import PageHeader from '@/components/ui/PageHeader';
import GroupedLinks, { groupLinks } from '@/components/listing/GroupedLinks';

export const metadata: Metadata = buildMetadata({
  title: 'Maryland Breweries by City',
  description:
    'Browse Maryland craft breweries by city, from Baltimore and Frederick to Ocean City, with brewery counts and maps for each town.',
  path: '/cities',
});

export const revalidate = 3600; // refresh hourly

export default async function CitiesIndexPage() {
  const { byCity } = await getProcessedBreweryData();

  // One entry per city listing, filed under the county most of its breweries are in
  const cities = [...byCity.values()].map((breweries) => {
    const name = breweries[0].city;
    const counties = new Map<string, number>();
    for (const b of breweries)
      if (b.county) counties.set(b.county, (counties.get(b.county) ?? 0) + 1);
    const county = [...counties.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      name,
      href: `/cities/${slugify(name)}/breweries`,
      count: breweries.length,
      county: county ? countyLabel(county) : null,
    };
  });
  const groups = groupLinks(
    cities,
    (c) => c.county,
    (c) => ({ label: c.name, href: c.href, count: c.count })
  );

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Cities', path: '/cities' },
        ]}
        title="Breweries by city"
        intro={`${cities.length} Maryland cities and towns with breweries, by county. The number is how many breweries each has.`}
      />
      <GroupedLinks groups={groups} jumpLabel="Jump to a county" />
    </div>
  );
}
