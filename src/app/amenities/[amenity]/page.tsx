import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getAllAmenities } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import AmenityBreweriesMapClient from './AmenityBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Amenity definitions keyed by lowercase
const AMENITY_DEFINITIONS: Record<string, string> = {
  'food': 'More than just bar snacks—these breweries have food options. Expect everything from appetizers to full meals, often designed to complement the house beers.',
  'outdoor seating': 'Enjoy your craft beer under the open sky. Breweries with outdoor seating offer patios, decks, beer gardens, or lawn areas—perfect for soaking up Maryland\'s beautiful weather.',
  'live music': 'Good beer and good tunes go hand in hand. These breweries feature live performances from local musicians, bands, and artists—turning your brewery visit into a full entertainment experience.',
  'games': 'Add some friendly competition to your brewery visit. From cornhole and shuffleboard to board games and arcade cabinets, these breweries keep you entertained between sips.',
  'parking': 'Skip the parking hassle. These breweries offer dedicated parking lots or ample street parking, making it easy to visit without the stress of finding a spot.',
  'pet friendly': 'Bring your four-legged friend along for the adventure. Pet-friendly breweries welcome well-behaved animals, often offering water bowls, treats, and plenty of pats from fellow beer lovers.',
  'wheelchair accessible': 'These breweries ensure everyone can enjoy great craft beer. With accessible entrances, restrooms, and seating, they welcome guests of all abilities.',
  'private events': 'Celebrate at a brewery! These spots offer private event spaces for birthdays, corporate gatherings, weddings, and more—with craft beer flowing all night.',
  'growler fills': 'Take fresh draft beer home with you. Breweries offering growler fills let you bring your own jug or buy one on-site—keeping the party going at home.',
  'crowler machine': 'The best of both worlds—draft freshness in a convenient can. Crowlers are 32oz cans filled and sealed on-site, perfect for taking fresh beer wherever you go.',
  'merchandise': 'Take home more than memories. These breweries sell branded merchandise—t-shirts, hats, glassware, and more—so you can rep your favorite spot.',
  'tours': 'Go behind the scenes and see how the magic happens. Brewery tours take you through the brewing process, from grain to glass, often ending with tastings.',
  'tastings': 'Sample before you commit. Breweries offering tastings let you try flights of different beers, perfect for discovering new favorites or exploring the full lineup.',
  'food trucks': 'The best of local food culture meets craft beer. Breweries with food trucks bring in rotating vendors serving everything from tacos to BBQ—so you can pair your pint with something delicious.',
  'wifi': 'Need to catch up on work or share your brewery adventures? These breweries offer free WiFi so you can stay connected while enjoying your craft beer.',
  'tvs': 'Catch the game while enjoying a cold one. These breweries have TVs for sports, events, and entertainment—perfect for game days.',
  'pool table': 'Challenge your friends to a game of pool while sipping on local brews. These breweries have pool tables for some classic bar entertainment.',
  'cornhole': 'The quintessential outdoor bar game. These breweries have cornhole boards for laid-back fun in the sun with your favorite craft beer.',
  'fire pit': 'Cozy up by the fire with a great beer. Fire pits add warmth and ambiance, making these breweries perfect for cooler evenings.',
  'family friendly': 'The whole family is welcome here. Family-friendly breweries offer a welcoming environment for kids, often with games, kid-friendly menu options, and plenty of space.',
  'date night': 'Looking for the perfect spot for two? These breweries offer a romantic or intimate atmosphere ideal for date nights.',
  'group friendly': 'Bring the whole crew! These breweries have space and amenities to accommodate larger groups comfortably.',
  'heated patio': 'Extend the outdoor season with a heated patio. These breweries let you enjoy the fresh air even when temperatures drop.',
  'covered patio': 'Enjoy the outdoors rain or shine. Covered patios provide shelter while still giving you that open-air brewery experience.',
  'dart board': 'Classic pub entertainment awaits. These breweries have dart boards for friendly competition between rounds.',
};

/**
 * Get all unique amenities from the data and generate slugs
 */
async function getAllAmenitySlugs(): Promise<string[]> {
  const amenities = await getAllAmenities();
  return amenities.map(amenity => slugify(amenity));
}

/**
 * Amenity alias mappings for common URL variations
 * Maps old/alternative slugs to actual database amenity names
 */
const AMENITY_ALIASES: Record<string, string> = {
  'in-house': 'Full Kitchen',
  'visitors-welcome': 'Allows Visitors',
  'dog-friendly': 'Pet Friendly',
  'pet-friendly': 'Pet Friendly',
  'beer-to-go': 'Beer To Go',
  'outdoor-seating': 'Outdoor Seating',
  'full-kitchen': 'Full Kitchen',
  'live-music': 'Live Music',
  'food-trucks': 'Food Trucks',
  'private-events': 'Private Events',
  'growler-fills': 'Growler Fills',
  'crowler-machine': 'Crowler Machine',
  'wheelchair-accessible': 'Wheelchair Accessible',
  'family-friendly': 'Family Friendly',
  'group-friendly': 'Group Friendly',
};

/**
 * Find matching amenity from the database given a URL slug
 * Returns the original amenity string from the database if found
 */
function findMatchingAmenity(slug: string, allAmenities: string[]): string | null {
  const slugLower = slug.toLowerCase();
  
  // First check aliases
  if (AMENITY_ALIASES[slugLower]) {
    const aliasedName = AMENITY_ALIASES[slugLower];
    // Check if the aliased name exists in the database
    for (const amenity of allAmenities) {
      if (amenity.toLowerCase() === aliasedName.toLowerCase()) {
        return amenity;
      }
    }
  }
  
  // Try to find an amenity whose slugified form matches the URL slug
  for (const amenity of allAmenities) {
    if (slugify(amenity).toLowerCase() === slugLower) {
      return amenity;
    }
  }
  
  // Try deslugify and partial match
  const deslugified = deslugify(slug).toLowerCase();
  for (const amenity of allAmenities) {
    if (amenity.toLowerCase() === deslugified) {
      return amenity;
    }
    // Also try if the amenity contains the deslugified term
    if (amenity.toLowerCase().includes(deslugified) || deslugified.includes(amenity.toLowerCase())) {
      return amenity;
    }
  }
  
  return null;
}

export async function generateStaticParams() {
  const amenitySlugs = await getAllAmenitySlugs();
  return amenitySlugs.map((slug) => ({ amenity: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ amenity: string }> }): Promise<Metadata> {
  const { amenity } = await params;
  const processed = await getProcessedBreweryData();
  const allAmenities = processed.amenities;
  
  const matchedAmenity = findMatchingAmenity(amenity, allAmenities);
  if (!matchedAmenity) {
    return {
      title: 'Amenity Not Found',
    };
  }
  
  const amenityKey = matchedAmenity.toLowerCase();
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => 
      a.toLowerCase() === amenityKey || a.toLowerCase().includes(amenityKey) || amenityKey.includes(a.toLowerCase())
    )
  );
  
  // Format display name (Title Case, handle WiFi specially)
  const displayName = matchedAmenity.replace(/\bWifi\b/i, 'WiFi');

  const title = `${displayName} Breweries in Maryland | ${breweries.length} Local Craft Breweries`;
  const description = breweries.length > 0
    ? `Explore ${breweries.length} breweries with ${displayName.toLowerCase()} across Maryland. Find the best ${displayName.toLowerCase()} breweries in Baltimore, Annapolis, Frederick, and more with hours, locations, and visitor information.`
    : `Discover Maryland's craft beer scene. While breweries with ${displayName.toLowerCase()} aren't listed yet, check other amenities for great craft beer options.`;

  return {
    title,
    description,
    alternates: { canonical: `/amenities/${amenity}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/amenities/${amenity}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${displayName} Breweries in Maryland`,
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

export default async function AmenityPage({ params }: { params: Promise<{ amenity: string }> }) {
  const { amenity } = await params;
  const processed = await getProcessedBreweryData();
  const allAmenities = processed.amenities;
  
  // Find matching amenity from the database
  const matchedAmenity = findMatchingAmenity(amenity, allAmenities);
  if (!matchedAmenity) {
    notFound();
  }
  
  const amenityKey = matchedAmenity.toLowerCase();
  const displayName = matchedAmenity.replace(/\bWifi\b/i, 'WiFi');

  // Filter breweries by amenity
  const breweries = processed.breweries.filter(
    (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => 
      a.toLowerCase() === amenityKey || a.toLowerCase().includes(amenityKey) || amenityKey.includes(a.toLowerCase())
    )
  );
  
  // Return 404 if no breweries found
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

  // Get hero image
  const heroImagePath = '/cities-hero.jpg';
  const heroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasHeroImage = existsSync(heroImageFile);

  // Calculate stats
  const totalBreweries = breweries.length;

  // Get amenity definition
  const amenityDefinition = AMENITY_DEFINITIONS[amenityKey] || AMENITY_DEFINITIONS[matchedAmenity.toLowerCase()];

  // Prepare data for BreweriesByLocationTabs
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
        {/* Hero Image Background */}
        {hasHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={heroImagePath}
              alt={`${displayName} breweries`}
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
        {!hasHeroImage && (
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
                <Link href="/amenities" className="hover:text-white transition-colors drop-shadow-md">
                  Amenities
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <Link href={`/amenities/${amenity}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  {displayName}
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            {displayName} Breweries in Maryland
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
          <AmenityBreweriesMapClient 
            breweries={sortedBreweries} 
            amenityName={displayName} 
            amenityDefinition={amenityDefinition}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}
