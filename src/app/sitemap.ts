import type { MetadataRoute } from 'next';
import { getProcessedBreweryData, getAllCities, getAllTypes, getAllAmenities, getAllNeighborhoods, getAttractionBySlug } from '@/lib/db';
import { normalizeCountyName } from '../lib/data-utils';
import { slugify, deslugify } from '@/lib/slug';
import { MARYLAND_COUNTIES } from '@/types/brewery';
import { hasBestBreweriesPage } from '../lib/best-breweries';
import { sortByDistance } from '../lib/geo';
import { isIndexableNeighborhood, neighborhoodPath } from '../lib/neighborhoods';

const BASE_URL = 'https://www.marylandbrewery.com';

// Region definitions
const MARYLAND_REGIONS = ['eastern-shore', 'western-maryland', 'central-maryland', 'southern-maryland', 'capital-region'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const processed = await getProcessedBreweryData();
  const cities = await getAllCities();
  const allAmenities = await getAllAmenities();
  const allTypes = await getAllTypes();
  const neighborhoods = await getAllNeighborhoods();
  
  // Get counties from breweries and filter to only valid Maryland counties
  const rawCounties = Array.from(new Set(processed.breweries.map((b) => (b as any).county).filter(Boolean))) as string[];
  const counties = rawCounties.filter(county => {
    const slug = slugify(county);
    return normalizeCountyName(slug) !== null || MARYLAND_COUNTIES.some(c => c.toLowerCase() === county.toLowerCase());
  });
  
  // Convert amenity names to slugs
  const amenitySlugs = allAmenities.map(amenity => slugify(amenity));
  // Convert type names to slugs
  const typeSlugs = allTypes.map(type => slugify(type));

  const lastMod = new Date();

  const urls: MetadataRoute.Sitemap = [];

  // Homepage (no trailing slash - Next.js default)
  urls.push({ url: BASE_URL, lastModified: lastMod, priority: 1.0 });

  // Important static pages
  urls.push({ url: `${BASE_URL}/map`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/best-breweries`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/open-now`, lastModified: lastMod, priority: 0.7 });
  urls.push({ url: `${BASE_URL}/contact`, lastModified: lastMod, priority: 0.6 });
  urls.push({ url: `${BASE_URL}/cities`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/counties`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/amenities`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/type`, lastModified: lastMod, priority: 0.8 });
  
  // Region definitions with counties
  const REGION_COUNTIES: Record<string, string[]> = {
    'eastern-shore': ['Dorchester', 'Somerset', 'Wicomico', 'Worcester', 'Talbot', 'Caroline', 'Kent', "Queen Anne's", 'Cecil'],
    'western-maryland': ['Allegany', 'Garrett', 'Washington', 'Frederick'],
    'central-maryland': ['Baltimore', 'Baltimore City', 'Baltimore County', 'Carroll', 'Harford', 'Howard'],
    'southern-maryland': ["Prince George's", "St. Mary's", 'Calvert', 'Charles', "Anne Arundel"],
    'capital-region': ['Montgomery', "Prince George's", 'Howard'],
  };
  
  // Region pages - only include regions that have breweries
  for (const region of MARYLAND_REGIONS) {
    const regionCounties = REGION_COUNTIES[region] || [];
    const regionBreweries = processed.breweries.filter((b: any) =>
      b.county && regionCounties.some(county => 
        b.county.toLowerCase() === county.toLowerCase() || 
        (county === 'Baltimore' && b.county.toLowerCase() === 'baltimore county')
      )
    );
    
    // Only add to sitemap if there are breweries in this region
    if (regionBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/region/${region}`, lastModified: lastMod, priority: 0.7 });
    }
  }

  // Open by day pages - only include days that have open breweries
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const day of days) {
    const dayBreweries = processed.breweries.filter((b) => {
      const hours = b.hours as any;
      if (!hours) return false;
      const h = hours[day.toLowerCase() as keyof typeof hours];
      if (!h || /closed/i.test(h)) return false;
      return true;
    });
    
    // Only add to sitemap if there are breweries open on this day
    if (dayBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/open/${day}`, lastModified: lastMod, priority: 0.5 });
    }
  }

  // City pages (canonical versions only - -md versions excluded from sitemap)
  // Only include cities that have breweries
  for (const city of cities) {
    const cityBreweries = processed.breweries.filter((b: any) => 
      b.city && b.city.toLowerCase() === city.toLowerCase()
    );
    
    // Only add to sitemap if city has breweries
    if (cityBreweries.length > 0) {
      const citySlug = slugify(city);
      urls.push({ url: `${BASE_URL}/cities/${citySlug}/breweries`, lastModified: lastMod, priority: 0.9 });
      // Best breweries pages exist only for cities with 5+ breweries
      if (hasBestBreweriesPage(cityBreweries.length)) {
        urls.push({ url: `${BASE_URL}/best-breweries/${citySlug}`, lastModified: lastMod, priority: 0.8 });
      }
    }
  }

  // County pages (canonical versions only - -md versions excluded from sitemap)
  // Only include counties that have breweries (already filtered, but double-check)
  for (const county of counties) {
    const countyBreweries = processed.breweries.filter((b: any) => 
      b.county && b.county.toLowerCase() === county.toLowerCase()
    );
    
    // Only add to sitemap if county has breweries
    if (countyBreweries.length > 0) {
      const countySlug = slugify(county);
      urls.push({ url: `${BASE_URL}/counties/${countySlug}/breweries`, lastModified: lastMod, priority: 0.7 });
    }
  }

  // Individual breweries
  for (const b of processed.breweries) {
    // The brewery page 404s without a name and city; don't list it until the data is fixed
    if (!b.name || !b.city) continue;
    const slug = (b as any).slug || b.id;
    const lm = (b as any).lastUpdated ? new Date((b as any).lastUpdated) : lastMod;
    urls.push({ url: `${BASE_URL}/breweries/${slug}`, lastModified: lm, priority: 0.8 });
  }

  // Type pages - only include types that have breweries
  for (const typeSlug of typeSlugs) {
    const typeName = deslugify(typeSlug);
    const typeKey = typeName.toLowerCase();
    const typeBreweries = processed.breweries.filter((b) => {
      if (Array.isArray(b.type)) {
        return b.type.some(t => t.toLowerCase() === typeKey);
      }
      return b.type?.toLowerCase() === typeKey;
    });
    
    // Only add to sitemap if there are breweries of this type
    if (typeBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/type/${typeSlug}`, lastModified: lastMod, priority: 0.7 });
    }
  }

  // Amenity pages - only include amenities that have breweries
  for (const amenitySlug of amenitySlugs) {
    const amenityLabel = deslugify(amenitySlug).replace(/\bWifi\b/i, 'WiFi').toLowerCase();
    const amenityBreweries = processed.breweries.filter(
      (b) => ((b as any).amenities || (b as any).features || []).some((a: string) => 
        a.toLowerCase() === amenityLabel || a.toLowerCase().includes(amenityLabel) || amenityLabel.includes(a.toLowerCase())
      )
    );
    
    // Only add to sitemap if there are breweries with this amenity
    if (amenityBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/amenities/${amenitySlug}`, lastModified: lastMod, priority: 0.6 });
    }
  }

  // Combination pages: city + amenity (only include combinations that have breweries)
  // Use the same logic as generateStaticParams to ensure consistency
  for (const amenitySlug of amenitySlugs) {
    // Normalize amenity label for matching (same as normalizeAmenityLabel in city/[amenity]/page.tsx)
    const amenityLabel = deslugify(amenitySlug).replace(/\bWifi\b/i, 'WiFi').toLowerCase();
    
    // Find all cities that have at least one brewery with this amenity
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
    
    // Only add sitemap URLs for city+amenity combinations that have breweries
    for (const city of citiesWithAmenity) {
      const citySlug = slugify(city);
      urls.push({ url: `${BASE_URL}/cities/${citySlug}/${amenitySlug}`, lastModified: lastMod, priority: 0.5 });
    }
  }

  // Neighborhood pages - only those with a brewery within 3 miles (the rest are noindex)
  for (const neighborhood of neighborhoods) {
    if (neighborhood.latitude == null || neighborhood.longitude == null) continue;
    const origin = { latitude: neighborhood.latitude, longitude: neighborhood.longitude };
    const nearest = sortByDistance(origin, processed.breweries)[0];
    if (isIndexableNeighborhood(nearest?.distance)) {
      urls.push({ url: `${BASE_URL}${neighborhoodPath(neighborhood.slug)}`, lastModified: lastMod, priority: 0.6 });
    }
  }

  // Near attraction pages: a few known high-value ones, only if they exist in maryland_attractions
  // (prompt 4 replaces this with the full list from the table)
  const highValueAttractions = ['deep-creek-lake', 'inner-harbor', 'national-aquarium', 'ocean-city-boardwalk'];
  const existingAttractions = await Promise.all(highValueAttractions.map((slug) => getAttractionBySlug(slug)));
  for (const attraction of existingAttractions) {
    if (attraction) {
      urls.push({ url: `${BASE_URL}/near/${attraction.slug}`, lastModified: lastMod, priority: 0.6 });
    }
  }

  return urls;
}
