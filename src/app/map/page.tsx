import { Metadata } from 'next';
import { Suspense } from 'react';
import { getProcessedBreweryData } from '@/lib/db';
import MapWithListClient from './MapWithListClient';
import PageHero from '@/components/directory/PageHero';
import { existsSync } from 'fs';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/jsonld';
import JsonLd from '@/components/seo/JsonLd';
import { join } from 'path';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Interactive Brewery Map of Maryland",
  description: "Every craft brewery in Maryland on one interactive map. Filter by amenity, see what's open and get directions.",
  path: '/map',
});

export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries;

  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Brewery Map', url: '/map', isActive: true },
  ];

  // Related pages for internal linking
  const relatedPages = [
    { title: 'Open Now', url: '/open-now', count: processed.breweries.length },
    { title: 'All Cities', url: '/cities', count: processed.cities.length },
    { title: 'All Counties', url: '/counties', count: processed.counties.length },
    { title: 'Browse by Amenity', url: '/amenities', count: 0 },
    { title: 'Browse by Type', url: '/type', count: 0 },
  ];

  // Check for map hero image
  const mapHeroImagePath = '/map-hero.jpg';
  const mapHeroImageFile = join(process.cwd(), 'public', 'map-hero.jpg');
  const hasMapHeroImage = existsSync(mapHeroImageFile);

  return (
    <div className="bg-paper min-h-screen">
      <JsonLd data={breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Brewery Map', path: '/map' }])} />
      <PageHero
        h1="Brewery Map"
        introText="Explore all Maryland breweries on an interactive map with a filterable directory. Search by name, city, type, or amenities to find the perfect brewery for your visit."
        breadcrumbs={breadcrumbs}
        heroImage={hasMapHeroImage ? mapHeroImagePath : null}
      />
      <div className="container mx-auto px-4 py-8 md:py-10">
        <Suspense fallback={<div className="text-center py-8 text-base font-sans text-muted">Loading map...</div>}>
          <MapWithListClient breweries={breweries} />
        </Suspense>
      </div>
    </div>
  );
}
