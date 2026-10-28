import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getProcessedBreweryData,
  getBreweriesByCity,
  getRegions,
} from '@/lib/db';
import { normalizeCountyName, isValidCountySlug } from '@/lib/data-utils';
import { slugify, deslugify } from '@/lib/slug';
import {
  SCORE_EXPLANATION,
  bestBreweriesCityPath,
  breweryScore,
  hasBestBreweriesPage,
  rankingReason,
} from '@/lib/best-breweries';
import { resolveLegacyNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { neighborhoodPath } from '@/lib/neighborhoods';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { bestBreweriesMeta } from '@/lib/seo/page-meta';
import { collectionPage } from '@/lib/seo/jsonld';
import ListingPage from '@/components/listing/ListingPage';
import { cityMoreLinks } from '@/lib/listing-links';
import JsonLd from '@/components/seo/JsonLd';

export async function generateStaticParams() {
  // No try/catch: a data error here should fail the build
  const processed = await getProcessedBreweryData();
  return Array.from(processed.byCity.entries())
    .filter(([, breweries]) => hasBestBreweriesPage(breweries.length))
    .map(([city]) => ({ slug: slugify(city) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: 'Location Not Found',
      robots: { index: false, follow: false },
    };
  }

  // Handle both regular and -md suffixed routes
  // Strip -md suffix if present
  const isMdRoute = slug.endsWith('-md');
  let slugWithoutMd = slug;
  if (isMdRoute) {
    slugWithoutMd = slug.substring(0, slug.length - 3);
  }

  // Try as city first
  const cityName = deslugify(slugWithoutMd);
  const cityBreweries = await getBreweriesByCity(cityName);
  if (cityBreweries.length > 0) {
    const displayName = cityBreweries[0].city;
    return buildMetadata({
      ...bestBreweriesMeta(displayName, cityBreweries.length),
      path: `/best-breweries/${slugWithoutMd}`,
    });
  }

  return {
    title: 'Location Not Found',
    robots: { index: false, follow: false },
  };
}

export default async function BestBreweriesSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  // Neighborhood pages moved to /neighborhoods/[slug]
  const neighborhoodSlug = await resolveLegacyNeighborhoodSlug(slug);
  if (neighborhoodSlug) {
    permanentRedirect(neighborhoodPath(neighborhoodSlug));
  }

  // Handle both regular and -md suffixed routes
  // Strip -md suffix if present
  const isMdRoute = slug.endsWith('-md');
  let slugWithoutMd = slug;
  if (isMdRoute) {
    slugWithoutMd = slug.substring(0, slug.length - 3);
  }

  const processed = await getProcessedBreweryData();

  // Try as city first
  const cityName = deslugify(slugWithoutMd);
  const cityBreweries = await getBreweriesByCity(cityName);
  if (cityBreweries.length > 0) {
    // Only cities with 5+ breweries have a best-of page; -md variants and smaller cities redirect
    const canonicalPath = bestBreweriesCityPath(
      slugify(cityName),
      cityBreweries.length
    );
    if (canonicalPath !== `/best-breweries/${slug}`) {
      permanentRedirect(canonicalPath);
    }

    // Ranked by score (lib/best-breweries); ties keep the city list's order
    const ranked = [...cityBreweries].sort(
      (a, b) => breweryScore(b) - breweryScore(a)
    );
    const city = ranked[0].city;
    const pagePath = `/best-breweries/${slugify(city)}`;

    return (
      <>
        <JsonLd
          data={collectionPage({
            name: `Best Breweries in ${city}, MD`,
            path: pagePath,
            breweries: ranked,
          })}
        />
        <ListingPage
          scope="best"
          title={`Best Breweries in ${city}`}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Best Breweries', path: '/best-breweries' },
            { name: `${city}, MD`, path: pagePath },
          ]}
          breweries={ranked}
          context="ranked by rating and number of reviews"
          intro={
            // The ranking is what makes this page different from the city listing
            <section
              aria-labelledby="ranking"
              className="flex flex-col gap-3 text-ink"
            >
              <h2
                id="ranking"
                className="m-0 font-display text-2xl font-semibold"
              >
                The {ranked.length} best breweries in {city}, ranked
              </h2>
              <p className="m-0 text-sm text-muted">{SCORE_EXPLANATION}</p>
              <ol className="m-0 grid list-none gap-2 p-0 md:grid-cols-2">
                {ranked.map((brewery, index) => (
                  <li
                    key={brewery.id}
                    className="flex gap-3 rounded-card border border-line bg-white p-3"
                  >
                    <span className="w-6 shrink-0 text-right font-display text-lg font-bold text-muted">
                      {index + 1}
                    </span>
                    <div>
                      <Link
                        href={`/breweries/${brewery.slug}`}
                        className="font-semibold text-ink hover:text-brand-red"
                      >
                        {brewery.name}
                      </Link>
                      <p className="m-0 text-sm text-muted">
                        {rankingReason(brewery)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          }
          related={[
            {
              title: `More in ${city}`,
              links: [
                {
                  label: `All ${city} breweries`,
                  href: `/cities/${slugify(city)}/breweries`,
                  count: ranked.length,
                },
                ...cityMoreLinks(city, ranked).filter(
                  (l) => !l.href.startsWith('/best-breweries')
                ),
              ],
            },
          ]}
        />
      </>
    );
  }

  // Counties and regions have their own main pages
  const normalizedCountyName = isValidCountySlug(slugWithoutMd)
    ? normalizeCountyName(slugWithoutMd)
    : null;
  if (normalizedCountyName) {
    const countyKey = normalizedCountyName.toLowerCase();
    if (
      processed.breweries.some(
        (b) => b.county && b.county.toLowerCase() === countyKey
      )
    ) {
      permanentRedirect(`/counties/${slugify(normalizedCountyName)}/breweries`);
    }
  }

  if ((await getRegions()).some((r) => r.slug === slugWithoutMd)) {
    permanentRedirect(`/region/${slugWithoutMd}`);
  }

  notFound();
}
