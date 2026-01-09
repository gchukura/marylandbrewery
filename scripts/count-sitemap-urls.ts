/**
 * Script to count expected URLs in the sitemap
 * Run with: npx tsx scripts/count-sitemap-urls.ts
 */

import { getProcessedBreweryData, getAllCities, getAllTypes, getAllAmenities } from '../lib/brewery-data';
import { slugify, deslugify, ALL_MD_COUNTIES, normalizeCountyName } from '../src/lib/data-utils';
import { supabase } from '../lib/supabase';

const BASE_URL = 'https://www.marylandbrewery.com';
const MARYLAND_REGIONS = ['eastern-shore', 'western-maryland', 'central-maryland', 'southern-maryland', 'capital-region'];

async function getAllNeighborhoods() {
  try {
    const { data, error } = await supabase
      .from('maryland_neighborhoods')
      .select('slug, city, name')
      .not('city', 'is', null)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch neighborhoods:', error);
    return [];
  }
}

async function main() {
  console.log('📊 Counting sitemap URLs...\n');

  const processed = await getProcessedBreweryData();
  const cities = await getAllCities();
  const allAmenities = await getAllAmenities();
  const allTypes = await getAllTypes();
  const neighborhoods = await getAllNeighborhoods();
  
  const rawCounties = Array.from(new Set(processed.breweries.map((b) => (b as any).county).filter(Boolean))) as string[];
  const counties = rawCounties.filter(county => {
    const slug = slugify(county);
    return normalizeCountyName(slug) !== null || ALL_MD_COUNTIES.some(c => c.toLowerCase() === county.toLowerCase());
  });
  
  const amenitySlugs = allAmenities.map(amenity => slugify(amenity));
  const typeSlugs = allTypes.map(type => slugify(type));

  let count = 0;
  const breakdown: Record<string, number> = {};

  // Homepage
  count++;
  breakdown['Homepage'] = 1;

  // Static pages
  const staticPages = 8; // map, best-breweries, open-now, contact, cities, counties, amenities, type
  count += staticPages;
  breakdown['Static pages'] = staticPages;

  // Region pages
  const regionPages = MARYLAND_REGIONS.length;
  count += regionPages;
  breakdown['Region pages'] = regionPages;

  // Open by day pages
  const dayPages = 7;
  count += dayPages;
  breakdown['Open by day pages'] = dayPages;

  // City pages (3 per city)
  const cityPages = cities.length * 3; // breweries, best-breweries, best-breweries/near
  count += cityPages;
  breakdown['City pages (3 per city)'] = cityPages;

  // County pages (2 per county)
  const countyPages = counties.length * 2; // breweries, best-breweries
  count += countyPages;
  breakdown['County pages (2 per county)'] = countyPages;

  // Individual breweries
  const breweryPages = processed.breweries.length;
  count += breweryPages;
  breakdown['Individual brewery pages'] = breweryPages;

  // Type pages
  const typePages = typeSlugs.length;
  count += typePages;
  breakdown['Type pages'] = typePages;

  // Amenity pages
  const amenityPages = amenitySlugs.length;
  count += amenityPages;
  breakdown['Amenity pages'] = amenityPages;

  // City + amenity combinations (only those with breweries)
  let cityAmenityCount = 0;
  for (const amenitySlug of amenitySlugs) {
    const amenityLabel = deslugify(amenitySlug).replace(/\bWifi\b/i, 'WiFi').toLowerCase();
    const citiesWithAmenity = new Set<string>();
    
    for (const brewery of processed.breweries) {
      if (!brewery.city) continue;
      
      const amenities = (brewery as any).amenities || (brewery as any).features || [];
      const hasAmenity = amenities.some((a: string) => 
        a.toLowerCase().includes(amenityLabel)
      );
      
      if (hasAmenity) {
        citiesWithAmenity.add(brewery.city);
      }
    }
    
    cityAmenityCount += citiesWithAmenity.size;
  }
  count += cityAmenityCount;
  breakdown['City + amenity combinations'] = cityAmenityCount;

  // Region best-breweries pages
  const regionBestPages = MARYLAND_REGIONS.length;
  count += regionBestPages;
  breakdown['Region best-breweries pages'] = regionBestPages;

  // Neighborhood pages (2 per neighborhood)
  const neighborhoodPages = neighborhoods.length * 2;
  count += neighborhoodPages;
  breakdown['Neighborhood pages (2 per neighborhood)'] = neighborhoodPages;

  // High-value attraction pages
  const attractionPages = 4;
  count += attractionPages;
  breakdown['Attraction pages'] = attractionPages;

  console.log('📈 Breakdown:');
  console.log('─'.repeat(60));
  Object.entries(breakdown).forEach(([key, value]) => {
    console.log(`${key.padEnd(40)} ${value.toString().padStart(6)}`);
  });
  console.log('─'.repeat(60));
  console.log(`\n🎯 Total Expected URLs: ${count.toLocaleString()}`);
  console.log(`\n📊 Data Summary:`);
  console.log(`   Breweries: ${processed.breweries.length}`);
  console.log(`   Cities: ${cities.length}`);
  console.log(`   Counties: ${counties.length}`);
  console.log(`   Types: ${typeSlugs.length}`);
  console.log(`   Amenities: ${amenitySlugs.length}`);
  console.log(`   Neighborhoods: ${neighborhoods.length}`);
  console.log(`   Avg cities per amenity: ${(cityAmenityCount / amenitySlugs.length).toFixed(1)}`);
}

main().catch(console.error);

