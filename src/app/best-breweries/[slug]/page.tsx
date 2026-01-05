import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getBreweriesByCity, getAllCities } from '../../../../lib/brewery-data';
import { slugify, deslugify, normalizeCountyName, isValidCountySlug, ALL_MD_COUNTIES } from '@/lib/data-utils';
import { parseNeighborhoodSlug, isNeighborhoodSlug } from '@/lib/neighborhood-utils';
import { getNeighborhoodsByCity } from '../../../../lib/supabase-client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from '../../cities/[city]/breweries/CityBreweriesMapClient';
import CountyBreweriesMapClient from '../../counties/[county]/breweries/CountyBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';
import DirectoryPageTemplate from '@/components/directory/DirectoryPageTemplate';

const MARYLAND_REGIONS: Record<string, { name: string; counties: string[]; description: string }> = {
  'eastern-shore': {
    name: 'Eastern Shore',
    counties: ['Talbot', 'Dorchester', 'Wicomico', 'Worcester', 'Somerset', 'Caroline', 'Kent', "Queen Anne's", 'Cecil'],
    description: "Maryland's Eastern Shore offers a relaxed, rural brewery experience with scenic waterfront locations and farm-to-glass craft beer.",
  },
  'western-maryland': {
    name: 'Western Maryland',
    counties: ['Allegany', 'Garrett', 'Washington'],
    description: "The mountains of Western Maryland are home to breweries that celebrate the region's natural beauty and outdoor recreation culture.",
  },
  'central-maryland': {
    name: 'Central Maryland',
    counties: ['Baltimore City', 'Baltimore County', 'Howard', 'Carroll', 'Harford'],
    description: "The heart of Maryland's craft beer scene, Central Maryland features the highest concentration of breweries from urban Baltimore to suburban Howard County.",
  },
  'southern-maryland': {
    name: 'Southern Maryland',
    counties: ['Calvert', 'Charles', "St. Mary's"],
    description: "Southern Maryland's waterfront breweries combine craft beer with Chesapeake Bay culture and historic charm.",
  },
  'capital-region': {
    name: 'Capital Region',
    counties: ['Montgomery', "Prince George's"],
    description: "The DC suburbs offer diverse brewery experiences, from upscale taprooms to community-focused brewpubs serving the metropolitan area.",
  },
};

function calculateBreweryScore(brewery: any): number {
  const rating = brewery.googleRating || 0;
  const reviewCount = brewery.googleRatingCount || 0;
  const ratingScore = rating * 20;
  const reviewScore = reviewCount > 0 ? Math.log10(reviewCount) * 10 : 0;
  return ratingScore + reviewScore;
}

function computeBestBreweriesStats(breweries: any[]) {
  const total = breweries.length;
  const avgRating = breweries.length > 0
    ? (breweries.reduce((sum, b) => sum + (b.googleRating || 0), 0) / breweries.length).toFixed(1)
    : '0.0';
  const totalReviews = breweries.reduce((sum, b) => sum + (b.googleRatingCount || 0), 0);
  const topRated = breweries.length > 0 ? breweries[0].googleRating?.toFixed(1) || '0.0' : '0.0';

  return [
    { label: 'Top Breweries', value: total },
    { label: 'Avg Rating', value: avgRating },
    { label: 'Total Reviews', value: totalReviews.toLocaleString() },
    { label: 'Highest Rated', value: topRated },
  ];
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  try {
    // Add cities
    const cities = await getAllCities();
    if (cities && cities.length > 0) {
      cities.forEach(city => {
        params.push({ slug: slugify(city) });
      });
    }
  } catch (error) {
    console.error('Error fetching cities for generateStaticParams:', error);
  }
  
  // Add counties
  ALL_MD_COUNTIES.forEach(county => {
    params.push({ slug: slugify(county) });
  });
  
  // Add regions
  Object.keys(MARYLAND_REGIONS).forEach(region => {
    params.push({ slug: region });
  });
  
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Location Not Found',
    };
  }

  // Check if it's a neighborhood slug first
  const neighborhoodData = await parseNeighborhoodSlug(slug);
  if (neighborhoodData) {
    const { neighborhood, cityName } = neighborhoodData;
    const cityBreweries = await getBreweriesByCity(cityName);
    
    const bestBreweries = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    const title = `Best Breweries in ${neighborhood.name}, ${cityName}, MD | Top-Rated Craft Breweries`;
    const description = `Find the best breweries in ${neighborhood.name}, ${cityName}, Maryland ranked by ratings and reviews. Discover ${bestBreweries.length} top-rated craft breweries in ${neighborhood.name}.`;

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
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `Best Breweries in ${neighborhood.name}, ${cityName}, MD`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
      },
    };
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
    const bestBreweries = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
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
            url: '/og-image.jpg',
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
        images: ['/og-image.jpg'],
      },
    };
  }

  // Try as county
  // Use normalizeCountyName to handle apostrophes properly
  const normalizedCountyName = isValidCountySlug(slugWithoutMd) 
    ? normalizeCountyName(slugWithoutMd) 
    : null;
  
  if (normalizedCountyName) {
    const countyKey = normalizedCountyName.toLowerCase();
    const countyBreweries = processed.breweries.filter(b => {
      const breweryCounty = (b as any).county;
      return breweryCounty && breweryCounty.toLowerCase() === countyKey;
    });
    
    if (countyBreweries.length > 0) {
      const bestBreweries = countyBreweries
        .map((brewery: any) => ({
          ...brewery,
          score: calculateBreweryScore(brewery),
        }))
        .sort((a: any, b: any) => b.score - a.score);

      const title = `Best Breweries in ${normalizedCountyName} County, MD | Top-Rated Craft Breweries`;
      const description = `Find the best breweries in ${normalizedCountyName} County, Maryland ranked by ratings and reviews. Discover ${bestBreweries.length} top-rated craft breweries in ${normalizedCountyName} County.`;

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
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `Best Breweries in ${normalizedCountyName} County, MD`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
      },
    };
    }
  }

  // Try as region
  const regionData = MARYLAND_REGIONS[slugWithoutMd];
  if (regionData) {
    const regionBreweries = processed.breweries.filter((b: any) =>
      regionData.counties.some(county => 
        b.county && b.county.toLowerCase() === county.toLowerCase()
      )
    );
    
    const bestBreweries = regionBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    const title = isMdRoute 
      ? `Best Breweries in ${regionData.name}, MD | Top-Rated Craft Breweries`
      : `Best Breweries in ${regionData.name} | Top-Rated Craft Breweries`;
    const description = `Find the best breweries in ${regionData.name}${isMdRoute ? ', MD' : ''} ranked by ratings and reviews. Discover ${bestBreweries.length} top-rated craft breweries in ${regionData.name}.`;

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
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `Best Breweries in ${regionData.name}${isMdRoute ? ', MD' : ''}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
      },
    };
  }

  return {
    title: 'Location Not Found',
  };
}

export default async function BestBreweriesSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    notFound();
  }

  // Check if it's a neighborhood slug first
  const neighborhoodData = await parseNeighborhoodSlug(slug);
  if (neighborhoodData) {
    const { neighborhood, cityName } = neighborhoodData;
    const cityBreweries = await getBreweriesByCity(cityName);
    
    // Calculate scores for all breweries
    const breweriesWithScores = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    if (cityBreweries.length === 0) {
      notFound();
    }

    // Get city hero image
    const citySlugForImage = slugify(cityName);
    const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
    const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
    const hasLocalCityImage = existsSync(localCityImageFile);
    
    const breweryFallbackImage = breweriesWithScores.length > 0 
      ? (breweriesWithScores[0].photos && breweriesWithScores[0].photos.length > 0
          ? breweriesWithScores[0].photos[0]
          : breweriesWithScores[0].photoUrl)
      : null;
    
    const heroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

    // Get neighborhoods for this city from Supabase
    const allNeighborhoods = await getNeighborhoodsByCity(cityName);
    const neighborhoods = allNeighborhoods.filter(
      (n) => n.name.toLowerCase().trim() !== cityName.toLowerCase().trim()
    );

    // Prepare data for BreweriesByLocationTabs
    const processed = await getProcessedBreweryData();
    
    const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
    processed.breweries.forEach((brewery: any) => {
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
    processed.breweries.forEach((brewery: any) => {
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
          {/* Hero Image Background */}
          {heroImage && (
            <div className="absolute inset-0">
              {heroImage.startsWith('http') ? (
                <img 
                  src={heroImage} 
                  alt={`Best breweries in ${neighborhood.name}, ${cityName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={heroImage}
                  alt={`Best breweries in ${neighborhood.name}, ${cityName}`}
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
          {!heroImage && (
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
                    {neighborhood.name}, {cityName}, MD
                  </Link>
                </li>
              </ol>
            </nav>

            {/* H1 Title */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Best Breweries in {neighborhood.name}, {cityName}, MD
            </h1>

            {/* Count Display */}
            <p 
              className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <strong className="text-white font-semibold">{breweriesWithScores.length}</strong> {breweriesWithScores.length === 1 ? 'brewery' : 'breweries'} found.
            </p>
          </div>
        </section>

        {/* Map and List Layout */}
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CityBreweriesMapClient 
              breweries={breweriesWithScores} 
              cityName={cityName} 
              neighborhoods={neighborhoods}
              neighborhood={neighborhood}
              showNeighborhoods={true}
              isNearPage={false}
            />
          </div>
        </section>

        {/* Breweries by Location Tabs */}
        <BreweriesByLocationTabs cities={cities} counties={counties} />
      </div>
    );
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
    // Calculate scores for all breweries (those without ratings will have score of 0)
    const breweriesWithScores = cityBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
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

  // Try as county
  // Use normalizeCountyName to handle apostrophes properly
  const normalizedCountyName = isValidCountySlug(slugWithoutMd) 
    ? normalizeCountyName(slugWithoutMd) 
    : null;
  
  if (normalizedCountyName) {
    const countyKey = normalizedCountyName.toLowerCase();
    const countyBreweries = processed.breweries.filter(b => {
      const breweryCounty = (b as any).county;
      return breweryCounty && breweryCounty.toLowerCase() === countyKey;
    });
    
    if (countyBreweries.length > 0) {
      const breweriesWithScores = countyBreweries
        .map((brewery: any) => ({
          ...brewery,
          score: calculateBreweryScore(brewery),
        }))
        .sort((a: any, b: any) => b.score - a.score);

      // Get county hero image
      const countySlugForImage = slugify(normalizedCountyName);
      const localCountyImagePath = `/counties/${countySlugForImage}.jpg`;
      const localCountyImageFile = join(process.cwd(), 'public', 'counties', `${countySlugForImage}.jpg`);
      const hasLocalCountyImage = existsSync(localCountyImageFile);
      const countyHeroImage = hasLocalCountyImage ? localCountyImagePath : null;

      // Prepare data for BreweriesByLocationTabs
      const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
      processed.breweries.forEach((brewery: any) => {
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
      processed.breweries.forEach((brewery: any) => {
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
            {/* County Hero Image Background */}
            {countyHeroImage && (
              <div className="absolute inset-0">
                <Image
                  src={countyHeroImage}
                  alt={`Best breweries in ${normalizedCountyName} County`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  unoptimized={false}
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
              </div>
            )}
            
            {/* Pattern overlay (only if no hero image) */}
            {!countyHeroImage && (
              <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
            )}
            
            <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
              {/* Breadcrumbs */}
              <nav className="mb-6" aria-label="Breadcrumb">
                <ol className={`flex items-center flex-wrap gap-2 text-sm ${countyHeroImage ? 'text-white/90' : ''}`} style={{ fontFamily: "'Source Sans 3', sans-serif", color: countyHeroImage ? undefined : '#6B6B6B' }}>
                  <li>
                    <Link 
                      href="/" 
                      className={`transition-colors ${countyHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                    >
                      Maryland Breweries
                    </Link>
                  </li>
                  <li><ChevronRight className={`h-4 w-4 mx-2 ${countyHeroImage ? 'text-white/70' : ''}`} /></li>
                  <li>
                    <Link 
                      href="/counties" 
                      className={`transition-colors ${countyHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                    >
                      Counties
                    </Link>
                  </li>
                  <li><ChevronRight className={`h-4 w-4 mx-2 ${countyHeroImage ? 'text-white/70' : ''}`} /></li>
                  <li>
                    <Link 
                      href={`/best-breweries/${slug}`} 
                      className={`font-medium transition-colors ${countyHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                    >
                      {isMdRoute ? `${normalizedCountyName} County, Maryland` : `${normalizedCountyName} County`}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* H1 Title */}
              <h1 
                className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ${
                  countyHeroImage 
                    ? 'text-white drop-shadow-lg' 
                    : 'text-[#1C1C1C]'
                }`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: countyHeroImage ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined }}
              >
                {isMdRoute ? `Best Breweries in ${normalizedCountyName} County, Maryland` : `Best Breweries in ${normalizedCountyName} County`}
              </h1>

              {/* Count Display */}
              <p 
                className={`text-lg md:text-xl mb-6 ${
                  countyHeroImage 
                    ? 'text-white/95 drop-shadow-md' 
                    : 'text-[#6B6B6B]'
                }`}
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                <strong className={countyHeroImage ? 'text-white font-semibold' : 'text-[#1C1C1C] font-semibold'}>{breweriesWithScores.length}</strong> {breweriesWithScores.length === 1 ? 'brewery' : 'breweries'} found.
              </p>
            </div>
          </section>

          {/* Map and List Layout */}
          <section className="bg-white py-8 md:py-12">
            <div className="container mx-auto px-4">
              <CountyBreweriesMapClient breweries={breweriesWithScores} countyName={normalizedCountyName} isMdRoute={isMdRoute} />
            </div>
          </section>

          {/* Breweries by Location Tabs */}
          <BreweriesByLocationTabs cities={cities} counties={counties} />
        </div>
      );
    }
  }

  // Try as region
  const regionData = MARYLAND_REGIONS[slugWithoutMd];
  if (regionData) {
    const regionBreweries = processed.breweries.filter((b: any) =>
      regionData.counties.some(county => 
        b.county && b.county.toLowerCase() === county.toLowerCase()
      )
    );

    const breweriesWithScores = regionBreweries
      .map((brewery: any) => ({
        ...brewery,
        score: calculateBreweryScore(brewery),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    if (regionBreweries.length === 0) {
      notFound();
    }

    // Get region hero image
    const regionSlugForImage = slugWithoutMd;
    const localRegionImagePath = `/regions/${regionSlugForImage}.jpg`;
    const localRegionImageFile = join(process.cwd(), 'public', 'regions', `${regionSlugForImage}.jpg`);
    const hasLocalRegionImage = existsSync(localRegionImageFile);
    const regionHeroImage = hasLocalRegionImage ? localRegionImagePath : null;

    // Prepare data for BreweriesByLocationTabs
    const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
    processed.breweries.forEach((brewery: any) => {
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
    processed.breweries.forEach((brewery: any) => {
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
          {/* Region Hero Image Background */}
          {regionHeroImage && (
            <div className="absolute inset-0">
              <Image
                src={regionHeroImage}
                alt={`Best breweries in ${regionData.name}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized={false}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
            </div>
          )}
          
          {/* Pattern overlay (only if no hero image) */}
          {!regionHeroImage && (
            <div className="absolute inset-0 md-pattern-bg pointer-events-none" />
          )}
          
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className={`flex items-center flex-wrap gap-2 text-sm ${regionHeroImage ? 'text-white/90' : ''}`} style={{ fontFamily: "'Source Sans 3', sans-serif", color: regionHeroImage ? undefined : '#6B6B6B' }}>
                <li>
                  <Link 
                    href="/" 
                    className={`transition-colors ${regionHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                  >
                    Maryland Breweries
                  </Link>
                </li>
                <li><ChevronRight className={`h-4 w-4 mx-2 ${regionHeroImage ? 'text-white/70' : ''}`} /></li>
                <li>
                  <Link 
                    href="/counties" 
                    className={`transition-colors ${regionHeroImage ? 'hover:text-white drop-shadow-md' : 'hover:text-[#9B2335]'}`}
                  >
                    Region
                  </Link>
                </li>
                <li><ChevronRight className={`h-4 w-4 mx-2 ${regionHeroImage ? 'text-white/70' : ''}`} /></li>
                <li>
                  <Link 
                    href={`/best-breweries/${slug}`} 
                    className={`font-medium transition-colors ${regionHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                  >
                    {isMdRoute ? `${regionData.name}, MD` : regionData.name}
                  </Link>
                </li>
              </ol>
            </nav>

            {/* H1 Title */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ${
                regionHeroImage 
                  ? 'text-white drop-shadow-lg' 
                  : 'text-[#1C1C1C]'
              }`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: regionHeroImage ? '2px 2px 4px rgba(0,0,0,0.5)' : undefined }}
            >
              {isMdRoute ? `Best Breweries in ${regionData.name}, MD` : `Best Breweries in ${regionData.name}`}
            </h1>

            {/* Count Display */}
            <p 
              className={`text-lg md:text-xl mb-6 ${
                regionHeroImage 
                  ? 'text-white/95 drop-shadow-md' 
                  : 'text-[#6B6B6B]'
              }`}
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              <strong className={regionHeroImage ? 'text-white font-semibold' : 'text-[#1C1C1C] font-semibold'}>{breweriesWithScores.length}</strong> {breweriesWithScores.length === 1 ? 'brewery' : 'breweries'} found.
            </p>
          </div>
        </section>

        {/* Map and List Layout */}
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CountyBreweriesMapClient breweries={breweriesWithScores} countyName={regionData.name} isMdRoute={isMdRoute} isRegion={true} />
          </div>
        </section>

        {/* Breweries by Location Tabs */}
        <BreweriesByLocationTabs cities={cities} counties={counties} />
      </div>
    );
  }

  notFound();
}

