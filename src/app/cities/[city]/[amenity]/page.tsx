import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityAmenityMapClient from './CityAmenityMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function normalizeAmenityLabel(slug: string): string {
  return deslugify(slug).replace(/\bWifi\b/i, 'WiFi');
}

export async function generateStaticParams() {
  const processed = await getProcessedBreweryData();
  
  // Only generate pages for city+amenity combinations that have at least one brewery
  const combinations: { city: string; amenity: string }[] = [];
  
  for (const amenitySlug of AMENITY_SLUGS) {
    const amenityLabel = normalizeAmenityLabel(amenitySlug).toLowerCase();
    
    // Group breweries by city that have this amenity
    const citiesWithAmenity = new Set<string>();
    
    for (const brewery of processed.breweries) {
      const amenities = (brewery as any).amenities || (brewery as any).features || [];
      const hasAmenity = amenities.some((a: string) => 
        a.toLowerCase().includes(amenityLabel)
      );
      
      if (hasAmenity && brewery.city) {
        citiesWithAmenity.add(brewery.city);
      }
    }
    
    // Add combinations for cities that have this amenity
    for (const city of citiesWithAmenity) {
      combinations.push({ city: slugify(city), amenity: amenitySlug });
    }
  }
  
  return combinations;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; amenity: string }> }): Promise<Metadata> {
  const { city, amenity } = await params;
  const processed = await getProcessedBreweryData();
  const cityName = deslugify(city);
  const cityKey = cityName.toLowerCase();
  const amenityLabel = normalizeAmenityLabel(amenity);
  const amenityKey = amenityLabel.toLowerCase();

  const cityBreweries: any[] = (processed.byCity instanceof Map 
    ? processed.byCity.get(cityKey)
    : (processed.byCity as any)?.[cityKey]) || [];
  const breweries = cityBreweries.filter(
    (b: any) => ((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey))
  );

  const title = `${amenityLabel} Breweries in ${cityName}, MD | ${breweries.length} Options`;
  
  const description = breweries.length > 0
    ? `Find ${breweries.length} breweries with ${amenityLabel.toLowerCase()} in ${cityName}, Maryland. Explore local taprooms and brewpubs offering ${amenityLabel.toLowerCase()} with detailed hours, locations, and visitor information.`
    : `Discover ${cityName}'s craft beer scene. While no breweries currently list ${amenityLabel.toLowerCase()}, check nearby cities for similar options or explore other amenities in ${cityName}, Maryland.`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city}/${amenity}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/${city}/${amenity}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${amenityLabel} Breweries in ${cityName}`,
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

export default async function CityAmenityPage({ params }: { params: Promise<{ city: string; amenity: string }> }) {
  const { city, amenity } = await params;
  const processed = await getProcessedBreweryData();
  const cityName = deslugify(city);
  const amenityLabel = normalizeAmenityLabel(amenity);
  const amenityKey = amenityLabel.toLowerCase();

  // Filter breweries by city and amenity
  const breweries = processed.breweries.filter(
    (b: any) => b.city.toLowerCase() === cityName.toLowerCase() &&
      (((b as any).amenities || (b as any).features || []).some((a: string) => a.toLowerCase().includes(amenityKey)))
  );

  // Return 404 if no breweries match this city+amenity combination
  if (breweries.length === 0) {
    notFound();
  }

  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...breweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get city hero image - prioritize local city image, fallback to brewery photo
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

  const totalBreweries = breweries.length;

  // Prepare data for BreweriesByLocationTabs
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
                alt={`${amenityLabel} breweries in ${cityName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`${amenityLabel} breweries in ${cityName}`}
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
                <Link href={`/cities/${city}/breweries`} className="hover:text-white transition-colors drop-shadow-md">
                  {cityName}
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <span className="text-white font-medium drop-shadow-md">
                  {amenityLabel}
                </span>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            {amenityLabel} Breweries in {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong className="text-white font-semibold">{totalBreweries}</strong> {totalBreweries === 1 ? 'brewery' : 'breweries'} with {amenityLabel.toLowerCase()} found.
          </p>
        </div>
      </section>

      {/* Map and List Layout */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <CityAmenityMapClient 
            breweries={sortedBreweries} 
            cityName={cityName} 
            amenityLabel={amenityLabel}
            amenitySlug={amenity}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}
