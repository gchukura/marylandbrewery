import type { MetadataRoute } from 'next';
import { getProcessedBreweryData, getAllCities, getAllTypes, getAllNeighborhoods, getAttractionBySlug, getRegions, breweriesInRegion } from '@/lib/db';
import { normalizeCountyName } from '../lib/data-utils';
import { slugify, deslugify } from '@/lib/slug';
import { MARYLAND_COUNTIES } from '@/types/brewery';
import { hasBestBreweriesPage } from '../lib/best-breweries';
import { AMENITIES, hasAmenity, isIndexableCityAmenity } from '../lib/amenities';
import { sortByDistance } from '../lib/geo';
import { isIndexableNeighborhood, neighborhoodPath } from '../lib/neighborhoods';

const BASE_URL = 'https://www.marylandbrewery.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const processed = await getProcessedBreweryData();
  const cities = await getAllCities();
  const allTypes = await getAllTypes();
  const neighborhoods = await getAllNeighborhoods();
  
  // Get counties from breweries and filter to only valid Maryland counties
  const rawCounties = Array.from(new Set(processed.breweries.map((b) => b.county).filter(Boolean))) as string[];
  const counties = rawCounties.filter(county => {
    const slug = slugify(county);
    return normalizeCountyName(slug) !== null || MARYLAND_COUNTIES.some(c => c.toLowerCase() === county.toLowerCase());
  });
  
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
  
  // Region pages - only include regions that have breweries
  for (const regionData of await getRegions()) {
    const region = regionData.slug;
    const regionBreweries = breweriesInRegion(regionData, processed.breweries);

    // Only add to sitemap if there are breweries in this region
    if (regionBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/region/${region}`, lastModified: lastMod, priority: 0.7 });
    }
  }

  // Open by day pages - only include days that have open breweries
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const day of days) {
    const dayBreweries = processed.breweries.filter((b) => {
      const hours = b.hours;
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
    const slug = b.slug || b.id;
    const lm = b.lastUpdated ? new Date(b.lastUpdated) : lastMod;
    urls.push({ url: `${BASE_URL}/breweries/${slug}`, lastModified: lm, priority: 0.8 });
  }

  // Type pages - only include types that have breweries
  for (const typeSlug of typeSlugs) {
    const typeName = deslugify(typeSlug);
    const typeKey = typeName.toLowerCase();
    const typeBreweries = processed.breweries.filter((b) => {
      return b.type.some((t) => t.toLowerCase() === typeKey);
    });
    
    // Only add to sitemap if there are breweries of this type
    if (typeBreweries.length > 0) {
      urls.push({ url: `${BASE_URL}/type/${typeSlug}`, lastModified: lastMod, priority: 0.7 });
    }
  }

  // Amenity pages, and city x amenity pages with 3+ breweries (smaller ones are noindex)
  for (const amenityDef of AMENITIES) {
    const withAmenity = processed.breweries.filter((b) => hasAmenity(b, amenityDef));
    if (withAmenity.length === 0) continue;
    urls.push({ url: `${BASE_URL}/amenities/${amenityDef.slug}`, lastModified: lastMod, priority: 0.6 });

    const countByCity = new Map<string, number>();
    for (const b of withAmenity) countByCity.set(slugify(b.city), (countByCity.get(slugify(b.city)) ?? 0) + 1);
    for (const [citySlug, count] of countByCity) {
      if (isIndexableCityAmenity(count)) {
        urls.push({ url: `${BASE_URL}/cities/${citySlug}/${amenityDef.slug}`, lastModified: lastMod, priority: 0.5 });
      }
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
