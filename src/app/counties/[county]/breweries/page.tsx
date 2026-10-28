import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData } from '@/lib/db';
import { normalizeCountyName, isValidCountySlug } from '@/lib/data-utils';
import { slugify } from '@/lib/slug';
import { MARYLAND_COUNTIES } from '@/types/brewery';
import { buildMetadata } from '@/lib/seo/metadata';
import { countyLabel, countyMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { cityLinks } from '@/lib/listing-links';

export async function generateStaticParams() {
  return MARYLAND_COUNTIES.map((c) => ({ county: slugify(c) }));
}

/** The county's name and breweries, or null for an unknown slug. -md URLs are 301'd by the middleware. */
async function loadCounty(param: string) {
  const countySlug = param.endsWith('-md') ? param.slice(0, -3) : param;
  if (!isValidCountySlug(countySlug)) return null;
  const countyName = normalizeCountyName(countySlug);
  if (!countyName) return null;
  const processed = await getProcessedBreweryData();
  const key = countyName.toLowerCase();
  return {
    countyName,
    breweries: processed.breweries.filter(
      (b) => b.county?.toLowerCase() === key
    ),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ county: string }>;
}): Promise<Metadata> {
  const data = await loadCounty((await params).county);
  if (!data)
    return {
      title: 'County Not Found',
      robots: { index: false, follow: false },
    };
  return buildMetadata({
    ...countyMeta(data.countyName, data.breweries.length),
    path: `/counties/${slugify(data.countyName)}/breweries`,
  });
}

export default async function CountyBreweriesPage({
  params,
}: {
  params: Promise<{ county: string }>;
}) {
  const data = await loadCounty((await params).county);
  if (!data || data.breweries.length === 0) notFound();
  const { countyName, breweries } = data;

  const label = countyLabel(countyName);
  const pagePath = `/counties/${slugify(countyName)}/breweries`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `Breweries in ${label}, MD`,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="county"
        title={`Breweries in ${label}`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Counties', path: '/counties' },
          { name: label, path: pagePath },
        ]}
        breweries={breweries}
        context={`${new Set(breweries.map((b) => b.city)).size} cities`}
        related={[
          { title: `Cities in ${label}`, links: cityLinks(breweries, 40) },
        ]}
      />
    </>
  );
}
