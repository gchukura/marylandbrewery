import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProcessedBreweryData } from '@/lib/db';
import { AMENITIES, getAmenity, hasAmenity } from '@/lib/amenities';
import { slugify } from '@/lib/slug';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import AmenityBreweriesMapClient from './AmenityBreweriesMapClient';
import { buildMetadata } from '@/lib/seo/metadata';
import { amenityMeta } from '@/lib/seo/page-meta';
import { breadcrumbList, collectionPage } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';

export async function generateStaticParams() {
  return AMENITIES.map((a) => ({ amenity: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ amenity: string }> }): Promise<Metadata> {
  const { amenity } = await params;
  const amenityDef = getAmenity(amenity);
  if (!amenityDef) {
    return {
      title: 'Amenity Not Found',
      robots: { index: false, follow: false },
    };
  }

  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries.filter((b) => hasAmenity(b, amenityDef));
  const displayName = amenityDef.label;

  return buildMetadata({ ...amenityMeta(displayName, breweries.length), path: `/amenities/${amenityDef.slug}` });
}

export default async function AmenityPage({ params }: { params: Promise<{ amenity: string }> }) {
  const { amenity } = await params;
  const amenityDef = getAmenity(amenity);
  if (!amenityDef) {
    notFound();
  }
  const processed = await getProcessedBreweryData();
  const displayName = amenityDef.label;
  const breweries = processed.breweries.filter((b) => hasAmenity(b, amenityDef));
  
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

  const amenityDefinition = amenityDef.description;

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

  const pagePath = `/amenities/${amenityDef.slug}`;
  const jsonLd = [
    collectionPage({ name: `${displayName} Breweries in Maryland`, path: pagePath, breweries: sortedBreweries }),
    breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Amenities', path: '/amenities' }, { name: displayName, path: pagePath }]),
  ];

  return (
    <div className="min-h-screen bg-paper">
      <JsonLd data={jsonLd} />
      {/* Hero Section */}
      <section className="bg-white border-b-4 border-brand-red relative overflow-hidden">
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
            <ol className="flex items-center flex-wrap gap-2 text-sm text-white/90">
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
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            {displayName} Breweries in Maryland
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
