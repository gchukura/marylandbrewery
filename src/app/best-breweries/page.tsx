import { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import {
  SCORE_EXPLANATION,
  bestBreweriesCityPath,
  breweryScore,
  hasBestBreweriesPage,
} from '@/lib/best-breweries';
import { buildMetadata } from '@/lib/seo/metadata';
import { collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import ListingPage from '@/components/listing/ListingPage';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = buildMetadata({
  title: 'Best Breweries in Maryland',
  description:
    "Maryland's top-rated craft breweries, ranked by Google rating and review volume, with best-of lists for the biggest beer towns.",
  path: '/best-breweries',
});

const TOP = 50;

export default async function BestBreweriesPage() {
  const processed = await getProcessedBreweryData();
  const ranked = [...processed.breweries]
    .sort((a, b) => breweryScore(b) - breweryScore(a))
    .slice(0, TOP);

  // Cities big enough for their own best-of list
  const cityLists = [...processed.byCity.values()]
    .filter((list) => hasBestBreweriesPage(list.length))
    .sort((a, b) => b.length - a.length)
    .map((list) => ({
      label: list[0].city,
      href: bestBreweriesCityPath(slugify(list[0].city), list.length),
      count: list.length,
    }));

  return (
    <>
      <JsonLd
        data={collectionPage({
          name: 'Best Breweries in Maryland',
          description: `Maryland's ${ranked.length} top-rated craft breweries, ranked by Google rating and review count.`,
          path: '/best-breweries',
          breweries: ranked,
        })}
      />
      <ListingPage
        scope="best"
        title="Best breweries in Maryland"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Best Breweries', path: '/best-breweries' },
        ]}
        breweries={ranked}
        summary={`The top ${ranked.length} of ${processed.breweries.length} breweries, ranked`}
        intro={<p className="m-0">{SCORE_EXPLANATION}</p>}
        related={[{ title: 'Best-of lists by city', links: cityLists }]}
      />
    </>
  );
}
