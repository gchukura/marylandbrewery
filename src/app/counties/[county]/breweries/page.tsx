import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../../../lib/brewery-data';
import { slugify, deslugify } from '@/lib/data-utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import '@/components/home-v2/styles.css';
import CountyBreweriesMapClient from './CountyBreweriesMapClient';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

export async function generateStaticParams() {
  return ALL_MD_COUNTIES.map(c => ({ county: slugify(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county } = await params;
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(county);
  const list = processed.breweries.filter(b => (b as any).county?.toLowerCase() === countyName.toLowerCase());
  const total = list.length;

  const title = `${countyName} County Breweries | ${total} in MD`;
  const description = total > 0
    ? `Explore ${total} craft breweries across ${countyName} County, Maryland. From historic downtowns to scenic countryside, discover taprooms, brewpubs, and tasting rooms with detailed information, hours, and amenities.`
    : `Discover Maryland's craft beer scene. While ${countyName} County doesn't have listed breweries yet, check nearby counties like Baltimore, Anne Arundel, and Montgomery for great craft beer options.`;

  return {
    title,
    description,
    alternates: { canonical: `/counties/${county}/breweries` },
    openGraph: {
      title,
      description,
      url: `https://www.marylandbrewery.com/counties/${county}/breweries`,
      siteName: 'Maryland Brewery Directory',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${countyName} County Breweries`,
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

export default async function CountyBreweriesPage({ params }: { params: Promise<{ county: string }> }) {
  const { county } = await params;
  const processed = await getProcessedBreweryData();
  const countyName = deslugify(county);
  const countyKey = countyName.toLowerCase();
  
  // Optimize filtering - use pre-indexed data if available
  const breweries = processed.breweries.filter(b => {
    const breweryCounty = (b as any).county;
    return breweryCounty && breweryCounty.toLowerCase() === countyKey;
  });
  
  // Sort breweries by rating (highest first), then by name
  const sortedBreweries = [...breweries].sort((a: any, b: any) => {
    const aRating = a.googleRating || a.yelpRating || 0;
    const bRating = b.googleRating || b.yelpRating || 0;
    if (bRating !== aRating) return bRating - aRating;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Get county hero image - check for local county image from Pexels
  const countySlug = slugify(countyName);
  const localCountyImagePath = `/counties/${countySlug}.jpg`;
  const localCountyImageFile = join(process.cwd(), 'public', 'counties', `${countySlug}.jpg`);
  
  // Check if local county image exists
  const hasLocalCountyImage = existsSync(localCountyImageFile);
  
  // Use local county image if available
  const countyHeroImage = hasLocalCountyImage ? localCountyImagePath : null;

  // Calculate stats
  const totalBreweries = breweries.length;

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
        {/* County Hero Image Background */}
        {countyHeroImage && (
          <div className="absolute inset-0">
            <Image
              src={countyHeroImage}
              alt={`${countyName} County breweries`}
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
                  Home
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
                  href={`/counties/${county}/breweries`} 
                  className={`font-medium transition-colors ${countyHeroImage ? 'text-white drop-shadow-md hover:text-white' : 'text-[#1C1C1C] hover:text-[#9B2335]'}`}
                >
                  {countyName} County
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
            {countyName} County Breweries
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
            <strong className={countyHeroImage ? 'text-white font-semibold' : 'text-[#1C1C1C] font-semibold'}>{totalBreweries}</strong> {totalBreweries === 1 ? 'brewery' : 'breweries'} found.
          </p>
        </div>
      </section>

      {/* Map and List Layout */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <CountyBreweriesMapClient breweries={sortedBreweries} countyName={countyName} />
        </div>
      </section>

      {/* Breweries by Location Tabs */}
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </div>
  );
}
