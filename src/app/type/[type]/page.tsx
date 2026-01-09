import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData, getAllTypes } from '../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import TypeBreweriesMapClient from './TypeBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

// Brewery type definitions
const BREWERY_TYPE_DEFINITIONS: Record<string, string> = {
  'microbrewery': 'These are the heart of Maryland\'s craft beer movement. Microbreweries focus on quality over quantity, brewing smaller batches with care and creativity. Most of their beer heads out to local bars, restaurants, and bottle shops—though many have cozy tasting rooms where you can sample the latest creations straight from the source.',
  'brewpub': 'The best of both worlds—a restaurant and brewery under one roof. Brewpubs serve their house-brewed beers alongside a full food menu, making them perfect for a complete night out. The kitchen often creates dishes designed to pair perfectly with the beers being poured just feet away.',
  'taproom': 'Taprooms put the beer front and center. These spaces are all about the drinking experience—think rotating taps, knowledgeable staff, and a relaxed atmosphere. Food is usually minimal (think snacks or food trucks), so you can focus on what matters: exploring great craft beer with friends.',
  'production': 'These are Maryland\'s brewing powerhouses. Production breweries have the capacity to brew large quantities and distribute their beer across the region—and sometimes beyond. Many still welcome visitors to their facilities, offering tours and taprooms where you can see brewing in action.',
  'nano': 'The smallest of the small, nano breweries are often passion projects run by dedicated brewers. With tiny batch sizes, they can experiment freely and create beers you won\'t find anywhere else. If you love discovering something truly unique, nano breweries are where the magic happens.',
  'farm-brewery': 'Farm breweries bring the farm-to-glass movement to Maryland\'s craft beer scene. Located on working farms, these breweries often grow their own hops, barley, or other ingredients. The result? Beer with a true sense of place, plus the chance to enjoy a beautiful rural setting while you sip.',
};

/**
 * Get all unique brewery types from the data and generate slugs
 */
async function getAllTypeSlugs(): Promise<string[]> {
  const types = await getAllTypes();
  return types.map(type => slugify(type));
}

/**
 * Normalize type name from slug - handles variations
 */
function normalizeTypeName(slug: string, allTypes: string[]): string | null {
  const slugLower = slug.toLowerCase();
  
  // Try exact match first
  const exactMatch = allTypes.find(t => slugify(t).toLowerCase() === slugLower);
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const caseInsensitiveMatch = allTypes.find(t => t.toLowerCase() === slugLower);
  if (caseInsensitiveMatch) return caseInsensitiveMatch;
  
  // Try deslugify and match
  const deslugified = deslugify(slug);
  const deslugifiedMatch = allTypes.find(t => t.toLowerCase() === deslugified.toLowerCase());
  if (deslugifiedMatch) return deslugifiedMatch;
  
  return null;
}

export async function generateStaticParams() {
  const typeSlugs = await getAllTypeSlugs();
  return typeSlugs.map((slug) => ({ type: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const processed = await getProcessedBreweryData();
  const allTypes = processed.types;
  
  const normalizedType = normalizeTypeName(type, allTypes);
  if (!normalizedType) {
    return {
      title: 'Brewery Type Not Found',
    };
  }
  
  const typeKey = normalizedType.toLowerCase();
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(t => t.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  
  const typeLabel = normalizedType;
  const typeLabelLower = typeLabel.toLowerCase();
  const title = `${typeLabel} Breweries in Maryland | ${breweries.length} Local Craft Breweries`;
  const description = breweries.length > 0
    ? `Explore ${breweries.length} ${typeLabelLower} breweries across Maryland. Find top ${typeLabelLower} breweries in Baltimore, Annapolis, Frederick, and other cities. Complete guide with hours, amenities, and visitor information.`
    : `Discover Maryland's craft beer scene. While ${typeLabelLower} breweries aren't listed yet, check other brewery types for great craft beer options.`;
  
  return {
    title,
    description,
    alternates: { canonical: `/type/${type}` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/type/${type}`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${typeLabel} Breweries in Maryland`,
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

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const processed = await getProcessedBreweryData();
  const allTypes = processed.types;
  
  // Normalize type name from slug
  const normalizedType = normalizeTypeName(type, allTypes);
  if (!normalizedType) {
    notFound();
  }
  
  const typeKey = normalizedType.toLowerCase();
  const typeLabel = normalizedType;
  
  // Filter breweries by type
  const breweries = processed.breweries.filter((b) => {
    if (Array.isArray(b.type)) {
      return b.type.some(t => t.toLowerCase() === typeKey);
    }
    return b.type?.toLowerCase() === typeKey;
  });
  
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

  // Get hero image - use cities-hero as fallback
  const heroImagePath = '/cities-hero.jpg';
  const heroImageFile = join(process.cwd(), 'public', 'cities-hero.jpg');
  const hasHeroImage = existsSync(heroImageFile);

  // Calculate stats
  const totalBreweries = breweries.length;

  // Get type definition
  const typeDefinition = BREWERY_TYPE_DEFINITIONS[type] || BREWERY_TYPE_DEFINITIONS[typeKey];

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
              alt={`${typeLabel} breweries`}
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
                <Link href="/type" className="hover:text-white transition-colors drop-shadow-md">
                  Types
                </Link>
              </li>
              <li><ChevronRight className="h-4 w-4 mx-2 text-white/70" /></li>
              <li>
                <Link href={`/type/${type}`} className="text-white font-medium drop-shadow-md hover:text-white transition-colors">
                  {typeLabel}
                </Link>
              </li>
            </ol>
          </nav>

          {/* H1 Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            {typeLabel} Breweries in Maryland
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
          <TypeBreweriesMapClient 
            breweries={sortedBreweries} 
            typeName={typeLabel} 
            typeDefinition={typeDefinition}
          />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}
