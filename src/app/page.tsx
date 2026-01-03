import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../lib/brewery-data';
import HeroV2 from '@/components/home-v2/HeroV2';
import ValuePropsV2 from '@/components/home-v2/ValuePropsV2';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';
import { slugify } from '@/lib/data-utils';

export const metadata: Metadata = {
  title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
  description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities. Interactive map, brewery hours, and complete guide to Maryland\'s craft beer scene.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
    description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities. Interactive map and complete guide.',
    url: 'https://www.marylandbrewery.com',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Craft Breweries Across Maryland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maryland Brewery Directory | Craft Breweries Across Maryland',
    description: 'Discover the best craft breweries across Maryland. Find breweries by city, county, type, and amenities.',
    images: ['/og-image.jpg'],
  },
};

export default async function HomePage() {
  const data = await getProcessedBreweryData();
  
  // Process cities - get unique cities with counts, sorted by count descending
  const cityCounts = new Map<string, { name: string; slug: string; count: number }>();
  data.breweries.forEach((brewery: any) => {
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
  const cities = Array.from(cityCounts.values()).sort((a, b) => b.count - a.count);

  // Process counties - get unique counties with counts
  const countyCounts = new Map<string, { name: string; slug: string; count: number }>();
  data.breweries.forEach((brewery: any) => {
    if (brewery.county) {
      const slug = slugify(brewery.county);
      const existing = countyCounts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        countyCounts.set(slug, { name: brewery.county, slug, count: 1 });
      }
    }
  });
  const counties = Array.from(countyCounts.values()).sort((a, b) => b.count - a.count);

  return (
    <>
      <HeroV2 />
      <ValuePropsV2 />
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </>
  );
}
