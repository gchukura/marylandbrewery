import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getAllTypes } from '@/lib/db';
import { slugify, deslugify } from '@/lib/slug';
import { buildMetadata } from '@/lib/seo/metadata';
import { typeMeta, typePlural } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage, { byRating } from '@/components/listing/ListingPage';
import { typeLinks } from '@/lib/listing-links';

const BREWERY_TYPE_DEFINITIONS: Record<string, string> = {
  microbrewery:
    "These are the heart of Maryland's craft beer movement. Microbreweries focus on quality over quantity, brewing smaller batches with care and creativity. Most of their beer heads out to local bars, restaurants, and bottle shops—though many have cozy tasting rooms where you can sample the latest creations straight from the source.",
  brewpub:
    'The best of both worlds—a restaurant and brewery under one roof. Brewpubs serve their house-brewed beers alongside a full food menu, making them perfect for a complete night out. The kitchen often creates dishes designed to pair perfectly with the beers being poured just feet away.',
  taproom:
    'Taprooms put the beer front and center. These spaces are all about the drinking experience—think rotating taps, knowledgeable staff, and a relaxed atmosphere. Food is usually minimal (think snacks or food trucks), so you can focus on what matters: exploring great craft beer with friends.',
  production:
    "These are Maryland's brewing powerhouses. Production breweries have the capacity to brew large quantities and distribute their beer across the region—and sometimes beyond. Many still welcome visitors to their facilities, offering tours and taprooms where you can see brewing in action.",
  nano: "The smallest of the small, nano breweries are often passion projects run by dedicated brewers. With tiny batch sizes, they can experiment freely and create beers you won't find anywhere else. If you love discovering something truly unique, nano breweries are where the magic happens.",
  'farm-brewery':
    "Farm breweries bring the farm-to-glass movement to Maryland's craft beer scene. Located on working farms, these breweries often grow their own hops, barley, or other ingredients. The result? Beer with a true sense of place, plus the chance to enjoy a beautiful rural setting while you sip.",
};

/**
 * Normalize type name from slug - handles variations
 */
function normalizeTypeName(slug: string, allTypes: string[]): string | null {
  const slugLower = slug.toLowerCase();

  // Try exact match first
  const exactMatch = allTypes.find(
    (t) => slugify(t).toLowerCase() === slugLower
  );
  if (exactMatch) return exactMatch;

  // Try case-insensitive match
  const caseInsensitiveMatch = allTypes.find(
    (t) => t.toLowerCase() === slugLower
  );
  if (caseInsensitiveMatch) return caseInsensitiveMatch;

  // Try deslugify and match
  const deslugified = deslugify(slug);
  const deslugifiedMatch = allTypes.find(
    (t) => t.toLowerCase() === deslugified.toLowerCase()
  );
  if (deslugifiedMatch) return deslugifiedMatch;

  return null;
}

export async function generateStaticParams() {
  return (await getAllTypes()).map((type) => ({ type: slugify(type) }));
}

async function loadType(slug: string) {
  const processed = await getProcessedBreweryData();
  const type = normalizeTypeName(slug, processed.types);
  if (!type) return null;
  const key = type.toLowerCase();
  return {
    type,
    breweries: processed.breweries.filter((b) =>
      b.type.some((t) => t.toLowerCase() === key)
    ),
    all: processed.breweries,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const data = await loadType(type);
  if (!data)
    return {
      title: 'Brewery Type Not Found',
      robots: { index: false, follow: false },
    };
  return buildMetadata({
    ...typeMeta(data.type, data.breweries.length),
    path: `/type/${type}`,
  });
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const data = await loadType(type);
  if (!data || data.breweries.length === 0) notFound();
  const { breweries, all } = data;

  const plural = typePlural(data.type);
  const definition =
    BREWERY_TYPE_DEFINITIONS[type] ??
    BREWERY_TYPE_DEFINITIONS[data.type.toLowerCase()];
  const pagePath = `/type/${type}`;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: `${plural} in Maryland`,
          path: pagePath,
          breweries: byRating(breweries),
        })}
      />
      <ListingPage
        scope="type"
        title={`${plural} in Maryland`}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Brewery Types', path: '/type' },
          { name: plural, path: pagePath },
        ]}
        breweries={breweries}
        context={`${new Set(breweries.map((b) => b.city)).size} cities`}
        intro={definition ? <p className="m-0">{definition}</p> : undefined}
        locked={{ type: slugify(data.type) }}
        related={[
          {
            title: 'Other brewery types',
            links: typeLinks(all, slugify(data.type)),
          },
        ]}
      />
    </>
  );
}
