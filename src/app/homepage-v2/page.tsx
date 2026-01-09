import { Metadata } from 'next';
import { getProcessedBreweryData } from '../../../lib/brewery-data';
import HeroV2 from '@/components/home-v2/HeroV2';
import ValuePropsV2 from '@/components/home-v2/ValuePropsV2';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';
import { slugify } from '@/lib/data-utils';

// Mark as noindex so Google doesn't index the preview
export const metadata: Metadata = {
  title: 'Homepage V2 Preview | Maryland Brewery Directory',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomepageV2() {
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

  // Process types
  const typeCounts = new Map<string, { name: string; slug: string; count: number }>();
  const typeNames: Record<string, string> = {
    'microbrewery': 'Microbrewery',
    'brewpub': 'Brewpub', 
    'taproom': 'Taproom',
    'production': 'Production',
    'nano': 'Nano',
    'nanobrewery': 'Nanobrewery',
  };
  data.breweries.forEach((brewery: any) => {
    const types = Array.isArray(brewery.type) ? brewery.type : [brewery.type];
    types.forEach((type: string) => {
      if (type) {
        const slug = type.toLowerCase().replace(/\s+/g, '-');
        const existing = typeCounts.get(slug);
        if (existing) {
          existing.count++;
        } else {
          typeCounts.set(slug, { 
            name: typeNames[slug] || type, 
            slug, 
            count: 1 
          });
        }
      }
    });
  });
  const types = Array.from(typeCounts.values()).sort((a, b) => b.count - a.count);

  // Process amenities from brewery data
  const amenityKeys = [
    { key: 'dogFriendly', name: 'Dog-Friendly', slug: 'dog-friendly' },
    { key: 'food', name: 'Food Available', slug: 'food' },
    { key: 'outdoorSeating', name: 'Outdoor Seating', slug: 'outdoor-seating' },
    { key: 'liveMusic', name: 'Live Music', slug: 'live-music' },
    { key: 'offersTours', name: 'Brewery Tours', slug: 'tours' },
    { key: 'wifi', name: 'Free WiFi', slug: 'wifi' },
    { key: 'parking', name: 'Parking', slug: 'parking' },
    { key: 'petFriendly', name: 'Pet Friendly', slug: 'pet-friendly' },
    { key: 'familyFriendly', name: 'Family Friendly', slug: 'family-friendly' },
  ];
  
  const amenities = amenityKeys.map(({ key, name, slug }) => {
    const count = data.breweries.filter((b: any) => {
      const value = b[key];
      return value === true || value === 'Yes' || value === 'yes';
    }).length;
    return { name, slug, count };
  }).filter(a => a.count > 0).sort((a, b) => b.count - a.count);

  const totalLinks = cities.length + counties.length;

  return (
    <>
      {/* Dev Banner */}
      <div className="bg-[#D4A017] text-[#1C1C1C] text-center py-2 text-sm font-medium">
        ⚠️ PREVIEW MODE — This is /homepage-v2 (not production) — {totalLinks}+ internal links
      </div>
      
      <HeroV2 />
      <ValuePropsV2 />
      <BreweriesByLocationTabs cities={cities} counties={counties} />
    </>
  );
}

