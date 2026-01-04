import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getBreweriesByCity } from '../../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from '../../../[city]/breweries/CityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Major city coordinates (from brewery-content-utils.ts)
const MAJOR_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  baltimore: { lat: 39.2904, lng: -76.6122 },
  annapolis: { lat: 38.9784, lng: -76.4922 },
  frederick: { lat: 39.4143, lng: -77.4105 },
  rockville: { lat: 39.0840, lng: -77.1528 },
  gaithersburg: { lat: 39.1434, lng: -77.2014 },
  columbia: { lat: 39.2037, lng: -76.8610 },
  'silver spring': { lat: 38.9907, lng: -77.0261 },
  towson: { lat: 39.4015, lng: -76.6019 },
  bethesda: { lat: 38.9847, lng: -77.0947 },
  'ellicott city': { lat: 39.2673, lng: -76.7983 },
  westminster: { lat: 39.5754, lng: -76.9958 },
  cumberland: { lat: 39.6529, lng: -78.7575 },
  hagerstown: { lat: 39.6418, lng: -77.7200 },
  salisbury: { lat: 38.3607, lng: -75.5994 },
  'ocean city': { lat: 38.3365, lng: -75.0849 },
};

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get city coordinates - use major city coordinates or average of city breweries
async function getCityCoordinates(cityName: string): Promise<{ lat: number; lng: number } | null> {
  const cityKey = cityName.toLowerCase().trim();
  
  // Check major cities first
  if (MAJOR_CITY_COORDINATES[cityKey]) {
    return MAJOR_CITY_COORDINATES[cityKey];
  }
  
  // Fallback: calculate average from city breweries
  const cityBreweries = await getBreweriesByCity(cityName);
  const breweriesWithCoords = cityBreweries.filter((b: any) => b.latitude && b.longitude);
  
  if (breweriesWithCoords.length === 0) {
    return null;
  }
  
  const avgLat = breweriesWithCoords.reduce((sum: number, b: any) => sum + b.latitude, 0) / breweriesWithCoords.length;
  const avgLng = breweriesWithCoords.reduce((sum: number, b: any) => sum + b.longitude, 0) / breweriesWithCoords.length;
  
  return { lat: avgLat, lng: avgLng };
}

// Check if slug is a city slug (simple name, 1-2 words, optionally ending in -md)
function isCitySlug(slug: string): boolean {
  const parts = slug.split('-');
  // Remove -md suffix if present
  const slugWithoutMd = slug.endsWith('-md') ? slug.substring(0, slug.length - 3) : slug;
  const partsWithoutMd = slugWithoutMd.split('-');
  
  // City slugs are typically 1-2 words (1-2 parts)
  return partsWithoutMd.length <= 2;
}

export async function generateStaticParams() {
  // For now, return empty array - pages will be generated on-demand
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return {
      title: 'City Not Found',
    };
  }
  
  // Only handle city slugs for /breweries path
  if (!isCitySlug(slug)) {
    notFound();
  }
  
  // Handle as city slug
  const isMdRoute = slug.endsWith('-md');
  const citySlug = isMdRoute ? slug.substring(0, slug.length - 3) : slug;
  const cityName = deslugify(citySlug);
  const cityCoords = await getCityCoordinates(cityName);
  
  if (!cityCoords) {
    return {
      title: `Breweries near ${cityName}, MD`,
      description: `Find breweries near ${cityName}, Maryland.`,
    };
  }
  
  // Get all breweries to find those within 10 miles
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;
  
    const filteredBreweries = allBreweries.filter((brewery: any) => {
      // Must have valid coordinates
      if (!brewery.latitude || !brewery.longitude) return false;
      
      // Validate coordinate ranges (rough bounds for Maryland)
      if (brewery.latitude < 37 || brewery.latitude > 40 || 
          brewery.longitude < -80 || brewery.longitude > -75) {
        return false; // Invalid coordinates
      }
      
      const distance = calculateDistance(
        cityCoords.lat,
        cityCoords.lng,
        brewery.latitude,
        brewery.longitude
      );
      
      // Strictly within 10 miles
      return distance <= 10;
    });
  
  const title = `Breweries near ${cityName}, MD | ${filteredBreweries.length} Craft Breweries`;
  const description = `Find ${filteredBreweries.length} breweries within 10 miles of ${cityName}, Maryland. Discover craft breweries near this Maryland city.`;
  
  return {
    title,
    description,
    alternates: { canonical: `/cities/near/${slug}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/near/${slug}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Breweries near ${cityName}, MD`,
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

export default async function CityNearBreweriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }
  
  // Only handle city slugs for /breweries path
  if (!isCitySlug(slug)) {
    notFound();
  }
  
  // Handle as city slug
  const isMdRoute = slug.endsWith('-md');
  const citySlug = isMdRoute ? slug.substring(0, slug.length - 3) : slug;
  const cityName = deslugify(citySlug);
  const cityCoords = await getCityCoordinates(cityName);
  
  if (!cityCoords) {
    // Fallback: show city breweries if no coordinates
    const cityBreweries = await getBreweriesByCity(cityName);
    const sortedBreweries = [...cityBreweries].sort((a: any, b: any) => {
      const aRating = a.googleRating || a.yelpRating || 0;
      const bRating = b.googleRating || b.yelpRating || 0;
      if (bRating !== aRating) return bRating - aRating;
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <section className="bg-white border-b-4 border-[#9B2335] py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Breweries in {cityName}, MD
            </h1>
            <p className="text-lg md:text-xl mb-6">
              <strong>{sortedBreweries.length}</strong> {sortedBreweries.length === 1 ? 'brewery' : 'breweries'} found.
            </p>
          </div>
        </section>
        <section className="bg-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <CityBreweriesMapClient 
              breweries={sortedBreweries} 
              cityName={cityName} 
              neighborhoods={[]}
              showNeighborhoods={false}
            />
          </div>
        </section>
      </div>
    );
  }
  
  // Get all breweries to find those within 10 miles
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;
  
  // Filter breweries within 10 miles of city center
  const filteredBreweries = allBreweries
    .filter((brewery: any) => {
      // Must have valid coordinates
      if (!brewery.latitude || !brewery.longitude) return false;
      
      // Validate coordinate ranges (rough bounds for Maryland)
      if (brewery.latitude < 37 || brewery.latitude > 40 || 
          brewery.longitude < -80 || brewery.longitude > -75) {
        return false; // Invalid coordinates
      }
      
      const distance = calculateDistance(
        cityCoords.lat,
        cityCoords.lng,
        brewery.latitude,
        brewery.longitude
      );
      
      // Strictly within 10 miles (with small buffer for floating point precision)
      return distance <= 10.01;
    })
    .map((brewery: any) => {
      // Recalculate distance to ensure accuracy
      const distance = calculateDistance(
        cityCoords.lat,
        cityCoords.lng,
        brewery.latitude,
        brewery.longitude
      );
      return {
        ...brewery,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      };
    })
    .filter((brewery: any) => {
      // Final strict check - must be within 10 miles
      return brewery.distance <= 10;
    })
    .sort((a: any, b: any) => a.distance - b.distance);
  
  // Sort by rating (highest first), then by distance
  const sortedBreweries = [...filteredBreweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return a.distance - b.distance;
  });
  
  // Get city hero image
  const citySlugForImage = slugify(cityName);
  const localCityImagePath = `/cities/${citySlugForImage}.jpg`;
  const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlugForImage}.jpg`);
  const hasLocalCityImage = existsSync(localCityImageFile);
  
  // Get brewery fallback image
  const breweryFallbackImage = sortedBreweries.length > 0 
    ? (sortedBreweries[0].photos && sortedBreweries[0].photos.length > 0
        ? sortedBreweries[0].photos[0]
        : sortedBreweries[0].photoUrl)
    : null;
  
  const cityHeroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;
  
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
                alt={`Breweries near ${cityName}, MD`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`Breweries near ${cityName}, MD`}
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
                <Link href={`/cities/near/${slug}/breweries`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  Near {cityName}, MD
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Breweries near {cityName}, MD
          </h1>

          {/* Count Display */}
          <p 
            className="text-lg md:text-xl text-white/95 mb-6 drop-shadow-md"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            <strong className="text-white font-semibold">{sortedBreweries.length}</strong> {sortedBreweries.length === 1 ? 'brewery' : 'breweries'} found within 10 miles.
          </p>
        </div>
      </section>

      {/* Map and List Layout */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <CityBreweriesMapClient 
            breweries={sortedBreweries} 
            cityName={cityName} 
            neighborhoods={[]}
            showNeighborhoods={false}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}

