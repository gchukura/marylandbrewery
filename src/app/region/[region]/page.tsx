import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  breweriesInRegion,
  getProcessedBreweryData,
  getRegions,
} from '@/lib/db';
import { buildMetadata } from '@/lib/seo/metadata';
import { regionMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { cityLinks, countyLinks } from '@/lib/listing-links';

export async function generateStaticParams() {
  return (await getRegions()).map((region) => ({ region: region.slug }));
}

async function loadRegion(slug: string) {
  const region = (await getRegions()).find((r) => r.slug === slug);
  if (!region) return null;
  const processed = await getProcessedBreweryData();
  return { region, breweries: breweriesInRegion(region, processed.breweries) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const data = await loadRegion(region);
  if (!data)
    return {
      title: 'Region Not Found',
      robots: { index: false, follow: false },
    };
  return buildMetadata({
    ...regionMeta(
      data.region.name,
      data.breweries.length,
      data.region.counties
    ),
    path: `/region/${region}`,
  });
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const data = await loadRegion((await params).region);
  if (!data) notFound();
  const { region, breweries } = data;

  const pagePath = `/region/${region.slug}`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `Breweries in ${region.name}`,
          description: region.description,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="region"
        title={`Breweries in ${region.name}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Regions', path: '/region' },
          { name: region.name, path: pagePath },
        ]}
        breweries={breweries}
        context={`${region.counties.length} counties`}
        intro={
          region.description ? (
            <p className="m-0">{region.description}</p>
          ) : undefined
        }
        related={[
          {
            title: `Counties in ${region.name}`,
            links: countyLinks(breweries),
          },
          { title: `Cities in ${region.name}`, links: cityLinks(breweries) },
        ]}
      />
    </>
  );
}
