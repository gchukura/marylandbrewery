import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import MapClient from './MapClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Interactive Brewery Map - Maryland Brewery Directory',
  description: 'Interactive map of all Maryland breweries. Find breweries near you and explore the craft beer scene across the state. Search by location, filter by amenities, and discover new breweries.',
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: 'Interactive Brewery Map - Maryland Brewery Directory',
    description: 'Interactive map of all Maryland breweries. Find breweries near you and explore the craft beer scene across the state.',
    url: 'https://marylandbrewery.com/map',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Interactive Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Brewery Map - Maryland Brewery Directory',
    description: 'Interactive map of all Maryland breweries. Find breweries near you and explore the craft beer scene across the state.',
    images: ['/og-image.jpg'],
  },
};

export default async function MapPage() {
  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries as any[];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Interactive Brewery Map</h1>
        <p className="text-gray-600">Explore all Maryland breweries on the map.</p>
      </div>
      <div className="flex-1">
        <MapClient breweries={breweries} />
      </div>
    </div>
  );
}
