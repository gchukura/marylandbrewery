import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProcessedBreweryData, getBreweriesByCity, getRegions } from '@/lib/db';
import { normalizeCountyName, isValidCountySlug } from '@/lib/data-utils';
import { slugify, deslugify } from '@/lib/slug';
import { SCORE_EXPLANATION, bestBreweriesCityPath, breweryScore, hasBestBreweriesPage, rankingReason } from '@/lib/best-breweries';
import { parseNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { neighborhoodPath } from '@/lib/neighborhoods';
import { getNeighborhoodsByCity } from '@/lib/db';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from '../../cities/[city]/breweries/CityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';


export async function generateStaticParams() {
  // No try/catch: a data error here should fail the build
  const processed = await getProcessedBreweryData();
  return Array.from(processed.byCity.entries())
    .filter(([, breweries]) => hasBestBreweriesPage(breweries.length))
    .map(([city]) => ({ slug: slugify(city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    const bestBreweries = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: breweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    const title = `Best Breweries in ${cityName}, MD | Top-Rated Craft Breweries`;
    const description = `Find the best breweries in ${cityName}, Maryland ranked by ratings and reviews. Discover ${bestBreweries.length} top-rated craft breweries in ${cityName}.`;

    return {
      title,
      description,
      alternates: { canonical: `/best-breweries/${slug}` },
      openGraph: {
        title,
        description,
        url: `https://www.marylandbrewery.com/best-breweries/${slug}`,
        siteName: 'Maryland Brewery Directory',
        type: 'website',
        images: [
          {
            url: '/opengraph-image',
            width: 1200,
            height: 630,
            alt: `Best Breweries in ${cityName}, MD`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/opengraph-image'],
      },
    };
  }

  return {
    title: 'Location Not Found',
    robots: { index: false, follow: false },
  };
}

export default async function BestBreweriesSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    notFound();
  }

  // Neighborhood pages moved to /neighborhoods/[slug]
  const neighborhoodData = await parseNeighborhoodSlug(slug);
  if (neighborhoodData) {
    permanentRedirect(neighborhoodPath(neighborhoodData.neighborhood.slug));
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
    const canonicalPath = bestBreweriesCityPath(slugify(cityName), cityBreweries.length);
    if (canonicalPath !== `/best-breweries/${slug}`) {
      permanentRedirect(canonicalPath);
    }

    // Calculate scores for all breweries (those without ratings will have score of 0)
    const breweriesWithScores = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: breweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    if (cityBreweries.length === 0) {
      notFound();
    }

    // Sort by score (already sorted above)
    const sortedBreweries = breweriesWithScores;

    // Get city hero image
    const citySlugForImage = slugify(cityName);
    const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
    const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
    const hasLocalCityImage = existsSync(localCityImageFile);
    
    const breweryFallbackImage = sortedBreweries.length > 0 
      ? (sortedBreweries[0].photos && sortedBreweries[0].photos.length > 0
          ? sortedBreweries[0].photos[0]
          : sortedBreweries[0].photoUrl)
      : null;
    
    const cityHeroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

    // Get neighborhoods for this city from Supabase
    const allNeighborhoods = await getNeighborhoodsByCity(cityName);
    const neighborhoods = allNeighborhoods.filter(
      (neighborhood) => neighborhood.name.toLowerCase().trim() !== cityName.toLowerCase().trim()
    );

    // Prepare data for BreweriesByLocationTabs
    const processedForTabs = await getProcessedBreweryData();
    
    const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
    processedForTabs.breweries.forEach((brewery: any) => {
      if (brewery.city) {
        const citySlug = slugify(brewery.city);
        const existing = cityCounts.get(citySlug);
        if (existing) {
          existing.count++;
        } else {
          cityCounts.set(citySlug, { name: brewery.city, slug: citySlug, count: 1 });
        }
      }
    });
    const cities = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

    const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
    processedForTabs.breweries.forEach((brewery: any) => {
      if (brewery.county) {
        const countySlug = slugify(brewery.county);
        const existing = countyCounts.get(countySlug);
        if (existing) {
          existing.count++;
        } else {
          countyCounts.set(countySlug, { name: `${brewery.county} County`, slug: countySlug, count: 1 });
        }
      }
    });
    const counties = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        {/* Hero Section */}
        <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
          {/* City Hero Image Background */}
          {cityHeroImage && (
            <div className="absolute inset-0">
              {cityHeroImage.startsWith('http') ? (
                <img 
                  src={cityHeroImage} 
                  alt={`Best breweries in ${cityName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={cityHeroImage}
                  alt={`Best breweries in ${cityName}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  unoptimized={false}
                />
              )}
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </div>
          )}
          
          {/* Pattern overlay (only if no hero image) */}
          {!cityHeroImage && (
            <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
          )}
          
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center flex-wrap gap-2 text-sm text-white/90" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <li>
                  <Link href="/" className="hover:text-white transition-colors drop-shadow-md">
                    Maryland Breweries
                  </Link>
                </li>
                <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
                <li>
                  <Link href="/cities" className="hover:text-white transition-colors drop-shadow-md">
                    Cities
                  </Link>
                </li>
                <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
                <li>
                  <Link href={`/best-breweries/${slug}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                    {cityName}, MD
                  </Link>
                </li>
              </ol>
            </nav>

            {/* H1 Title */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Best Breweries in {cityName}, MD
            </h1>

            {/* Count Display */}
            <p 
              className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <strong className="text-white font-semibold">{sortedBreweries.length}</strong> {sortedBreweries.length === 1 ? 'brewery' : 'breweries'} found.
            </p>
          </div>
        </section>

        {/* The ranking: what makes this page different from the city listing */}
        <section className="border-b bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 font-[family-name:var(--font-playfair-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              The {sortedBreweries.length} best breweries in {cityName}, ranked
            </h2>
            <p className="mb-6 max-w-3xl text-sm text-gray-600">{SCORE_EXPLANATION}</p>
            <ol className="grid gap-3 md:grid-cols-2">
              {sortedBreweries.map((brewery, index) => (
                <li key={brewery.id} className="flex gap-3 rounded-lg border p-3">
                  <span className="w-8 shrink-0 text-right text-lg font-bold text-gray-500">{index + 1}</span>
                  <div>
                    <Link href={`/breweries/${brewery.slug}`} className="font-semibold text-gray-900 hover:underline">
                      {brewery.name}
                    </Link>
                    <p className="text-sm text-gray-600">{rankingReason(brewery)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Map and List Layout */}
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CityBreweriesMapClient breweries={sortedBreweries} cityName={cityName} neighborhoods={neighborhoods} />
          </div>
        </section>

        {/* Breweries by Location Tabs */}
        <BreweriesByLocationTabs cities={cities} counties={counties} />
      </div>
    );
  }

  // Counties and regions have their own main pages
  const normalizedCountyName = isValidCountySlug(slugWithoutMd)
    ? normalizeCountyName(slugWithoutMd)
    : null;
  if (normalizedCountyName) {
    const countyKey = normalizedCountyName.toLowerCase();
    if (processed.breweries.some((b) => b.county && b.county.toLowerCase() === countyKey)) {
      permanentRedirect(`/counties/${slugify(normalizedCountyName)}/breweries`);
    }
  }

  if ((await getRegions()).some((r) => r.slug === slugWithoutMd)) {
    permanentRedirect(`/region/${slugWithoutMd}`);
  }

  notFound();
}

