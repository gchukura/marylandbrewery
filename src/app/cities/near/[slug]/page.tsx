import { Metadata } from 'next';
import { getProcessedBreweryData, getBreweriesByCity } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import { getNeighborhoodBySlug, getNeighborhoodsByCity } from '../../../../../lib/supabase-client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CityBreweriesMapClient from '../../[city]/breweries/CityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

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

// Helper function to parse neighborhood slug and find the neighborhood
async function parseNeighborhoodSlug(slug: string): Promise<{ neighborhood: any; cityName: string; citySlug: string } | null> {
  const parts = slug.split('-');
  if (parts.length < 3 || parts[parts.length - 1] !== 'md') {
    return null;
  }
  
  // Remove 'md' from the end
  const slugWithoutMd = parts.slice(0, -1).join('-');
  
  // Strategy 1: Try simple split (assumes neighborhood-slug is different from city-slug)
  const simpleCitySlug = parts[parts.length - 2];
  const simpleNeighborhoodSlug = parts.slice(0, -2).join('-');
  let neighborhood = await getNeighborhoodBySlug(simpleNeighborhoodSlug);
  
  if (neighborhood) {
    const cityName = deslugify(simpleCitySlug);
    // Verify the neighborhood belongs to this city
    if (neighborhood.city && neighborhood.city.toLowerCase() === cityName.toLowerCase()) {
      return { neighborhood, cityName, citySlug: simpleCitySlug };
    }
    // If city doesn't match, continue to other strategies
    neighborhood = null;
  }
  
  // Strategy 2: If neighborhood and city have same slug, try to find by city first
  // Try different splits - assume city slug could be 1-3 words
  for (let cityWords = 1; cityWords <= Math.min(3, parts.length - 2); cityWords++) {
    const potentialCitySlug = parts.slice(-cityWords - 1, -1).join('-');
    const potentialNeighborhoodSlug = parts.slice(0, -cityWords - 1).join('-');
    
    if (potentialNeighborhoodSlug) {
      const potentialCityName = deslugify(potentialCitySlug);
      const cityNeighborhoods = await getNeighborhoodsByCity(potentialCityName);
      const foundNeighborhood = cityNeighborhoods.find(n => n.slug === potentialNeighborhoodSlug);
      
      if (foundNeighborhood) {
        return { neighborhood: foundNeighborhood, cityName: potentialCityName, citySlug: potentialCitySlug };
      }
    }
  }
  
  // Strategy 3: If still not found, try matching the entire slug (minus 'md') as neighborhood slug
  const fallbackNeighborhood = await getNeighborhoodBySlug(slugWithoutMd);
  if (fallbackNeighborhood && fallbackNeighborhood.city) {
    return { 
      neighborhood: fallbackNeighborhood, 
      cityName: fallbackNeighborhood.city, 
      citySlug: slugify(fallbackNeighborhood.city) 
    };
  }
  
  return null;
}

export async function generateStaticParams() {
  // For now, return empty array - pages will be generated on-demand
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const parsed = await parseNeighborhoodSlug(slug);
  if (!parsed) {
    return {
      title: 'Neighborhood Not Found',
    };
  }
  
  const { neighborhood, cityName } = parsed;

  // Get all breweries (not just city) to find breweries within 10 miles
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;

  // Filter breweries by neighborhood - use distance if neighborhood has coordinates, otherwise filter by name/address
  let filteredBreweries: any[] = [];
  if (neighborhood.latitude && neighborhood.longitude) {
    filteredBreweries = allBreweries
      .filter((brewery: any) => {
        if (!brewery.latitude || !brewery.longitude) return false;
        const distance = calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        );
        return distance <= 10; // Within 10 miles of neighborhood
      })
      .map((brewery: any) => ({
        ...brewery,
        distance: calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        ),
      }))
      .sort((a: any, b: any) => a.distance - b.distance);
  } else {
    // Fallback: filter by name/address containing neighborhood name (limit to city breweries)
    const cityBreweries = await getBreweriesByCity(cityName);
    const neighborhoodNameLower = neighborhood.name.toLowerCase();
    filteredBreweries = cityBreweries.filter((brewery: any) => {
      const nameMatch = brewery.name?.toLowerCase().includes(neighborhoodNameLower);
      const addressMatch = brewery.street?.toLowerCase().includes(neighborhoodNameLower) ||
                          brewery.description?.toLowerCase().includes(neighborhoodNameLower);
      return nameMatch || addressMatch;
    });
  }

  const title = `Breweries in ${neighborhood.name}, ${cityName} MD | ${filteredBreweries.length} Craft Breweries`;
  const description = `Find ${filteredBreweries.length} breweries in ${neighborhood.name}, ${cityName}, Maryland. Discover craft breweries in this ${cityName} neighborhood.`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/near/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/cities/near/${slug}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Breweries in ${neighborhood.name}, ${cityName}`,
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

export default async function NeighborhoodBreweriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const parsed = await parseNeighborhoodSlug(slug);
  if (!parsed) {
    return <div>Neighborhood not found</div>;
  }
  
  const { neighborhood, cityName, citySlug } = parsed;

  // Get all breweries (not just city) to find breweries within 10 miles
  const processed = await getProcessedBreweryData();
  const allBreweries = processed.breweries;

  // Filter breweries by neighborhood - use distance if neighborhood has coordinates, otherwise filter by name/address
  let filteredBreweries: any[] = [];
  if (neighborhood.latitude && neighborhood.longitude) {
    filteredBreweries = allBreweries
      .filter((brewery: any) => {
        if (!brewery.latitude || !brewery.longitude) return false;
        const distance = calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        );
        return distance <= 10; // Within 10 miles of neighborhood
      })
      .map((brewery: any) => ({
        ...brewery,
        distance: calculateDistance(
          neighborhood.latitude!,
          neighborhood.longitude!,
          brewery.latitude,
          brewery.longitude
        ),
      }))
      .sort((a: any, b: any) => a.distance - b.distance);
  } else {
    // Fallback: filter by name/address containing neighborhood name (limit to city breweries)
    const cityBreweries = await getBreweriesByCity(cityName);
    const neighborhoodNameLower = neighborhood.name.toLowerCase();
    filteredBreweries = cityBreweries.filter((brewery: any) => {
      const nameMatch = brewery.name?.toLowerCase().includes(neighborhoodNameLower);
      const addressMatch = brewery.street?.toLowerCase().includes(neighborhoodNameLower) ||
                          brewery.description?.toLowerCase().includes(neighborhoodNameLower);
      return nameMatch || addressMatch;
    });
  }

  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...filteredBreweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get city hero image
  const localCityImagePath = `/cities/${citySlug}.jpg`;
  const localCityImageFile = join(process.cwd(), 'public', 'cities', `${citySlug}.jpg`);
  const hasLocalCityImage = existsSync(localCityImageFile);
  
  // Get brewery fallback image
  const breweryFallbackImage = sortedBreweries.length > 0 
    ? (sortedBreweries[0].photos && sortedBreweries[0].photos.length > 0
        ? sortedBreweries[0].photos[0]
        : sortedBreweries[0].photoUrl)
    : null;
  
  const cityHeroImage = hasLocalCityImage ? localCityImagePath : breweryFallbackImage;

  // Calculate stats
  const totalBreweries = filteredBreweries.length;

  // Get neighborhoods for this city from Supabase
  const neighborhoods = await getNeighborhoodsByCity(cityName);

  // Prepare data for BreweriesByLocationTabs (reuse processed from above)
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
                alt={`${neighborhood.name}, ${cityName} breweries`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={cityHeroImage}
                alt={`${neighborhood.name}, ${cityName} breweries`}
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
                <Link href={`/cities/${citySlug}/breweries`} className="hover:text-white transition-colors drop-shadow-md">
                  {cityName}, MD
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <Link href={`/cities/near/${slug}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  {neighborhood.name}
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Breweries near {neighborhood.name}, {cityName}, MD
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
          <CityBreweriesMapClient 
            breweries={sortedBreweries} 
            cityName={cityName} 
            neighborhoods={[]}
            neighborhood={neighborhood}
            showNeighborhoods={false}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}

