import { Metadata } from 'next';
import { getProcessedBreweryData } from '@/lib/db';
import HeroV2 from '@/components/home-v2/HeroV2';
import ValuePropsV2 from '@/components/home-v2/ValuePropsV2';
import BreweriesByLocationTabs from '@/components/home-v2/BreweriesByLocationTabs';
import { buildMetadata } from '@/lib/seo/metadata';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = buildMetadata({
  title: "Maryland Brewery: Every Craft Brewery in Maryland",
  description: "Every craft brewery in Maryland on one map, with hours, what's open now, and guides by city, county, region and amenity.",
  path: '/',
  absoluteTitle: true,
});

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
