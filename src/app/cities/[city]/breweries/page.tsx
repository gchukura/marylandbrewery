import { Metadata } from 'next';
import { getAllCities, getBreweriesByCity, getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { generateCityTitle, generateCityDescription } from '@/lib/seo-utils';
import { getNeighborhoodsByCity } from '../../../../../lib/supabase-client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from './CityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Build all city pages (no limit)
export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map((city) => ({ city: slugify(city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = deslugify(city);
  const breweries = await getBreweriesByCity(cityName);
  const total = breweries.length;

  let title: string;
  let description: string;
  
  if (cityName.toLowerCase() === 'frederick') {
    title = `Breweries in Frederick Maryland | ${total} Local Craft Breweries`;
    description = `Explore ${total} breweries in Frederick, Maryland. Find the best craft beer spots in downtown Frederick and the surrounding area. Plan your Frederick brewery tour today!`;
  } else if (cityName.toLowerCase() === 'ocean city') {
    title = `Breweries in Ocean City Maryland | Beach Town Craft Beer Guide`;
    description = `Discover breweries in Ocean City, Maryland and nearby beach towns. Perfect for your next vacation or weekend getaway. Find ${total} craft breweries in the Ocean City area.`;
  } else {
    title = generateCityTitle(cityName, total);
    description = generateCityDescription(cityName, total, '');
  }

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/${city}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${cityName} Breweries`,
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

export default async function CityBreweriesPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = deslugify(city);
  
  // Use the helper function which handles Map serialization properly
  let breweries = await getBreweriesByCity(cityName);
  
  // Fallback: if no breweries found, try with processed data directly
  if (breweries.length === 0) {
    const processed = await getProcessedBreweryData();
    const cityKey = cityName.toLowerCase().trim();
    breweries = (processed.byCity instanceof Map 
      ? processed.byCity.get(cityKey)
      : (processed.byCity as any)?.[cityKey]) || [];
  }

  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...breweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get city hero image - prioritize local city image from Pexels, fallback to brewery photo
  const citySlug = slugify(cityName);
  const localCityImagePath = `/cities/${citySlug}.jpg`;
  const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlug}.jpg`);
  
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
                <Link href={`/cities/${city}/breweries`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
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
            Breweries in {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
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
