import { Metadata } from 'next';
import { getAllCities, getBreweriesByCity, getProcessedBreweryData } from '@/lib/db';
import { slugify, deslugify } from '@/lib/slug';
import { getNeighborhoodsByCity } from '@/lib/db';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import CityBreweriesMapClient from './CityBreweriesMapClient';
import { buildMetadata } from '@/lib/seo/metadata';
import { cityMeta } from '@/lib/seo/page-meta';
import { breadcrumbList, collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import { canOptimizeImage } from '@/lib/images';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Build all city pages (no limit)
export async function generateStaticParams() {
  // No try/catch: a data error here should fail the build, not ship zero city pages
  const cities = await getAllCities();
  return cities.filter((city) => city.trim().length > 0).map((city) => ({ city: slugify(city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const city = resolvedParams?.city;
  if (!city) {
    // Return default metadata if city is missing (shouldn't happen, but handle gracefully)
    return {
      title: 'City Breweries | Maryland Brewery Directory',
      description: 'Explore craft breweries in Maryland cities.',
    };
  }
  // Handle both regular and -md suffixed routes
  // Strip -md suffix if present
  const isMdRoute = city.endsWith('-md');
  let citySlug = city;
  if (isMdRoute) {
    citySlug = citySlug.substring(0, citySlug.length - 3);
  }
  const cityName = deslugify(citySlug);
  const breweries = await getBreweriesByCity(cityName);
  const total = breweries.length;

  // Proper casing ("Havre de Grace") comes from the data, not the slug
  const displayName = breweries[0]?.city ?? cityName;
  return buildMetadata({ ...cityMeta(displayName, total), path: `/cities/${citySlug}/breweries` });
}

export default async function CityBreweriesPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const city = resolvedParams?.city;
  if (!city) {
    // Return a not found page if city is missing
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">City Not Found</h1>
          <p className="text-lg text-gray-600">The requested city page could not be found.</p>
        </div>
      </div>
    );
  }
  // Handle both regular and -md suffixed routes
  // Strip -md suffix if present
  const isMdRoute = city.endsWith('-md');
  let citySlug = city;
  if (isMdRoute) {
    citySlug = citySlug.substring(0, citySlug.length - 3);
  }
  const cityName = deslugify(citySlug);
  
  // Use the helper function which handles Map serialization properly
  let breweries = await getBreweriesByCity(cityName);
  
  // Fallback: if no breweries found, try with processed data directly
  if (breweries.length === 0) {
    const processed = await getProcessedBreweryData();
    const cityKey = cityName.toLowerCase().trim();
    breweries = processed.byCity.get(cityKey) || [];
  }

  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...breweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get city hero image - prioritize local city image from Pexels, fallback to brewery photo
  const citySlugForImage = slugify(cityName);
  const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
  const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
  
  // Check if local city image exists
  const hasLocalCityImage = existsSync(localCityImageFile);
  
  // Get brewery fallback image
  const breweryFallbackImage = sortedBreweries.length > 0 
    ? (sortedBreweries[0].photos && sortedBreweries[0].photos.length > 0
        ? sortedBreweries[0].photos[0]
        : sortedBreweries[0].photoUrl)
    : null;
  
  // Use local city image if available, otherwise fallback to brewery photo
  const cityHeroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

  // Calculate stats
  const totalBreweries = breweries.length;

  // Get neighborhoods for this city from Supabase
  // Filter out neighborhoods where the name matches the city name (case-insensitive)
  const allNeighborhoods = await getNeighborhoodsByCity(cityName);
  const neighborhoods = allNeighborhoods.filter(
    (neighborhood) => neighborhood.name.toLowerCase().trim() !== cityName.toLowerCase().trim()
  );

  // Prepare data for BreweriesByLocationTabs
  const processed = await getProcessedBreweryData();
  
  // Process cities - get unique cities with counts
  const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.city) {
      const slug = slugify(brewery.city);
      const existing = cityCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        cityCounts.set(slug, { name: brewery.city, slug, count: 1 });
      }
    }
  });
  const cities = Array.from(cityCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Process counties - get unique counties with counts
  const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.county) {
      const slug = slugify(brewery.county);
      const existing = countyCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countyCounts.set(slug, { name: `${brewery.county} County`, slug, count: 1 });
      }
    }
  });
  const counties = Array.from(countyCounts.values()).sort((a, b) => a.name.localeCompare(b.name));

  const displayCity = sortedBreweries[0]?.city ?? cityName;
  const pagePath = `/cities/${citySlug}/breweries`;
  const jsonLd = [
    collectionPage({ name: `Breweries in ${displayCity}, MD`, path: pagePath, breweries: sortedBreweries }),
    breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Cities', path: '/cities' }, { name: `${displayCity}, MD`, path: pagePath }]),
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <JsonLd data={jsonLd} />
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-[#9B2335] relative overflow-hidden">
        {/* City Hero Image Background */}
        {cityHeroImage && (
          <div className="absolute inset-0">
            {!canOptimizeImage(cityHeroImage) ? (
              // eslint-disable-next-line @next/next/no-img-element -- host outside next.config remotePatterns
              <img 
                src={cityHeroImage} 
                alt={`${cityName} breweries`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`${cityName} breweries`}
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
            <ol className="flex items-center flex-wrap gap-2 text-sm text-white/90">
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
                <Link href={`/cities/${city}/breweries`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  {cityName}, MD
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Breweries in {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
          >
            <strong className="text-white font-semibold">{totalBreweries}</strong> {totalBreweries === 1 ? 'brewery' : 'breweries'} found.
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
