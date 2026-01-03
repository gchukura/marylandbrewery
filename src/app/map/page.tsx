import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import MapWithListClient from './MapWithListClient';
import PageHero from '@/components/directory/PageHero';
import { existsSync } from 'fs';
import { join } from 'path';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Brewery Map - Maryland Brewery Directory',
  description: 'Explore all Maryland breweries on an interactive map with filterable directory. Search by name, city, type, or amenities to find the perfect brewery. Discover taprooms, brewpubs, and microbreweries across Baltimore, Annapolis, Frederick, and more.',
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: 'Brewery Map - Maryland Brewery Directory',
    description: 'Interactive map of all Maryland breweries. Find breweries near you and explore the craft beer scene across the state.',
    url: 'https://www.marylandbrewery.com/map',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Brewery Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brewery Map - Maryland Brewery Directory',
    description: 'Interactive map of all Maryland breweries. Find breweries near you and explore the craft beer scene across the state.',
    images: ['/og-image.jpg'],
  },
};

export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries as any[];

  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
    { name: 'Brewery Map', url: '/map', isActive: true },
  ];

  // Related pages for internal linking
  const relatedPages = [
    { title: 'Open Now', url: '/open-now', count: processed.breweries.length },
    { title: 'All Cities', url: '/city', count: processed.cities.length },
    { title: 'All Counties', url: '/county', count: processed.counties.length },
    { title: 'Browse by Amenity', url: '/amenities', count: 0 },
    { title: 'Browse by Type', url: '/type', count: 0 },
  ];

  // Check for map hero image
  const mapHeroImagePath = '/map-hero.jpg';
  const mapHeroImageFile = join(process.cwd(), 'public', 'map-hero.jpg');
  const hasMapHeroImage = existsSync(mapHeroImageFile);

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Brewery Map"
        introText="Explore all Maryland breweries on an interactive map with a filterable directory. Search by name, city, type, or amenities to find the perfect brewery for your visit."
        breadcrumbs={breadcrumbs}
        heroImage={hasMapHeroImage ? mapHeroImagePath : null}
      />
      <div className="container mx-auto px-4 py-6">
        <MapWithListClient breweries={breweries} />
      </div>
    </div>
  );
}
