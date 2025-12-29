/**
 * Brewery Data Management with Build-Time Caching
 * Optimized for generating 500+ static pages on Vercel
 */

import { unstable_cache } from 'next/cache';
import { getBreweryDataFromSupabase } from './supabase-client';
import { 
  Brewery, 
  ProcessedBreweryData, 
  SiteStatistics, 
  BreweryType, 
  MarylandCounty,
  Amenity,
  COMMON_AMENITIES,
  MARYLAND_COUNTIES
} from '../src/types/brewery';

/**
 * Cached function to get all brewery data from Supabase
 * This fetches once per build and caches for the entire build process
 */
export const getAllBreweryData = unstable_cache(
  async (): Promise<Brewery[]> => {
    // getBreweryDataFromSupabase already includes beers, so we don't need to fetch separately
    const breweries = await getBreweryDataFromSupabase();
    return breweries;
  },
  ['brewery-data'], // Cache key
  {
    tags: ['brewery-data'],
    revalidate: 60, // Revalidate every 60 seconds in development
  }
);

/**
 * Process brewery data into efficient lookup structures
 * This single processing step powers ALL 500+ pages
 */
export async function processBreweryData(breweries: Brewery[]): Promise<ProcessedBreweryData> {
  const startTime = Date.now();
  
  // Initialize Maps for efficient lookups
  const byCity = new Map<string, Brewery[]>();
  const byCounty = new Map<string, Brewery[]>();
  const byType = new Map<string, Brewery[]>();
  const byAmenity = new Map<string, Brewery[]>();
  
  // Initialize arrays for unique values
  const cities: string[] = [];
  const counties: string[] = [];
  const amenities: string[] = [];
  const types: string[] = [];
  
  // Track unique values
  const citySet = new Set<string>();
  const countySet = new Set<string>();
  const amenitySet = new Set<string>();
  const typeSet = new Set<string>();
  
  // Process each brewery
  breweries.forEach(brewery => {
    // Group by city
    if (brewery.city) {
      const cityKey = brewery.city.toLowerCase().trim();
      if (!byCity.has(cityKey)) {
        byCity.set(cityKey, []);
      }
      byCity.get(cityKey)!.push(brewery);
      citySet.add(brewery.city);
    }
    
    // Group by county
    if (brewery.county) {
      const countyKey = brewery.county.toLowerCase().trim();
      if (!byCounty.has(countyKey)) {
        byCounty.set(countyKey, []);
      }
      byCounty.get(countyKey)!.push(brewery);
      countySet.add(brewery.county);
    }
    
    // Group by type
    const typeKey = Array.isArray(brewery.type) 
      ? brewery.type.join(', ').toLowerCase()
      : brewery.type.toLowerCase();
    if (!byType.has(typeKey)) {
      byType.set(typeKey, []);
    }
    byType.get(typeKey)!.push(brewery);
    if (Array.isArray(brewery.type)) {
      brewery.type.forEach(type => typeSet.add(type));
    } else {
      typeSet.add(brewery.type);
    }
    
    // Group by amenities
    brewery.amenities.forEach(amenity => {
      const amenityKey = amenity.toLowerCase().trim();
      if (!byAmenity.has(amenityKey)) {
        byAmenity.set(amenityKey, []);
      }
      byAmenity.get(amenityKey)!.push(brewery);
      amenitySet.add(amenity);
    });
  });
  
  // Convert sets to sorted arrays
  cities.push(...Array.from(citySet).sort());
  counties.push(...Array.from(countySet).sort());
  amenities.push(...Array.from(amenitySet).sort());
  types.push(...Array.from(typeSet).sort());
  
  // Calculate site statistics
  const stats = calculateSiteStatistics(breweries, {
    cities: cities.length,
    counties: counties.length,
    types: types.length,
    amenities: amenities.length,
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`Processed brewery data in ${duration}ms`);
    console.log(`- Cities: ${cities.length}`);
    console.log(`- Counties: ${counties.length}`);
    console.log(`- Types: ${types.length}`);
    console.log(`- Amenities: ${amenities.length}`);
  }
  
  return {
    breweries,
    byCity,
    byCounty,
    byType,
    byAmenity,
    cities,
    counties,
    amenities,
    types,
    stats,
  };
}

/**
 * Calculate comprehensive site statistics
 */
function calculateSiteStatistics(
  breweries: Brewery[], 
  counts: { cities: number; counties: number; types: number; amenities: number }
): SiteStatistics {
  // Count breweries by type
  const breweriesByType: Record<string, number> = {};
  const breweriesByCounty: Record<string, number> = {};
  
  breweries.forEach(brewery => {
    // Count by type
    if (Array.isArray(brewery.type)) {
      brewery.type.forEach(type => {
        breweriesByType[type] = (breweriesByType[type] || 0) + 1;
      });
    } else {
      breweriesByType[brewery.type] = (breweriesByType[brewery.type] || 0) + 1;
    }
    
    // Count by county
    const county = brewery.county;
    if (county) {
      breweriesByCounty[county] = (breweriesByCounty[county] || 0) + 1;
    }
  });
  
  // Find newest and oldest breweries
  const breweriesWithDates = breweries.filter(b => b.openedDate);
  const sortedByDate = breweriesWithDates.sort((a, b) => {
    const dateA = new Date(a.openedDate!).getTime();
    const dateB = new Date(b.openedDate!).getTime();
    return dateA - dateB;
  });
  
  const newestBrewery = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1].name : undefined;
  const oldestBrewery = sortedByDate.length > 0 ? sortedByDate[0].name : undefined;
  
  // Calculate average breweries per city
  const cityCounts = new Map<string, number>();
  breweries.forEach(brewery => {
    if (brewery.city) {
      const city = brewery.city.toLowerCase().trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  const totalCities = cityCounts.size;
  const averageBreweriesPerCity = totalCities > 0 ? breweries.length / totalCities : 0;
  
  return {
    totalBreweries: breweries.length,
    totalCities: counts.cities,
    totalCounties: counts.counties,
    breweriesByType,
    breweriesByCounty,
    averageBreweriesPerCity,
    newestBrewery,
    oldestBrewery,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Safely get value from a Map or object (handles cache serialization)
 */
function safeMapGet<T>(mapOrObj: Map<string, T> | Record<string, T> | undefined, key: string): T | undefined {
  if (!mapOrObj) return undefined;
  if (mapOrObj instanceof Map) {
    return mapOrObj.get(key);
  }
  return (mapOrObj as Record<string, T>)[key];
}

/**
 * Ensure Maps are properly initialized (handles cache serialization)
 */
function ensureMapsAreMaps(data: ProcessedBreweryData): ProcessedBreweryData {
  // If byCity is already a Map, return as-is
  if (data.byCity instanceof Map && 
      data.byCounty instanceof Map && 
      data.byType instanceof Map && 
      data.byAmenity instanceof Map) {
    return data;
  }
  
  // Convert objects back to Maps if they were serialized
  const byCity = new Map<string, Brewery[]>();
  const byCounty = new Map<string, Brewery[]>();
  const byType = new Map<string, Brewery[]>();
  const byAmenity = new Map<string, Brewery[]>();
  
  // Convert byCity
  if (data.byCity) {
    if (data.byCity instanceof Map) {
      data.byCity.forEach((value, key) => byCity.set(key, value));
    } else if (typeof data.byCity === 'object') {
      Object.entries(data.byCity as any).forEach(([key, value]) => {
        byCity.set(key, value as Brewery[]);
      });
    }
  }
  
  // Convert byCounty
  if (data.byCounty) {
    if (data.byCounty instanceof Map) {
      data.byCounty.forEach((value, key) => byCounty.set(key, value));
    } else if (typeof data.byCounty === 'object') {
      Object.entries(data.byCounty as any).forEach(([key, value]) => {
        byCounty.set(key, value as Brewery[]);
      });
    }
  }
  
  // Convert byType
  if (data.byType) {
    if (data.byType instanceof Map) {
      data.byType.forEach((value, key) => byType.set(key, value));
    } else if (typeof data.byType === 'object') {
      Object.entries(data.byType as any).forEach(([key, value]) => {
        byType.set(key, value as Brewery[]);
      });
    }
  }
  
  // Convert byAmenity
  if (data.byAmenity) {
    if (data.byAmenity instanceof Map) {
      data.byAmenity.forEach((value, key) => byAmenity.set(key, value));
    } else if (typeof data.byAmenity === 'object') {
      Object.entries(data.byAmenity as any).forEach(([key, value]) => {
        byAmenity.set(key, value as Brewery[]);
      });
    }
  }
  
  return {
    ...data,
    byCity,
    byCounty,
    byType,
    byAmenity,
  };
}

/**
 * Get processed brewery data with caching
 * This is the main function that powers all 500+ pages
 * Cached to avoid reprocessing data on every page generation
 */
export const getProcessedBreweryData = unstable_cache(
  async (): Promise<ProcessedBreweryData> => {
    // Get raw brewery data (cached)
    const breweries = await getAllBreweryData();
    
    // Process data into efficient lookup structures
    const processed = await processBreweryData(breweries);
    
    // Ensure Maps are properly initialized (handles cache serialization)
    return ensureMapsAreMaps(processed);
  },
  ['processed-brewery-data'], // Cache key
  {
    tags: ['brewery-data'],
    revalidate: 60, // Revalidate every 60 seconds in development
  }
);

/**
 * Get breweries by city with caching
 */
export const getBreweriesByCity = unstable_cache(
  async (city: string): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    const cityKey = city.toLowerCase().trim();
    return safeMapGet(processedData.byCity, cityKey) || [];
  },
  ['breweries-by-city'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get breweries by county with caching
 */
export const getBreweriesByCounty = unstable_cache(
  async (county: string): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    const countyKey = county.toLowerCase().trim();
    return safeMapGet(processedData.byCounty, countyKey) || [];
  },
  ['breweries-by-county'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get breweries by type with caching
 */
export const getBreweriesByType = unstable_cache(
  async (type: string): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    const typeKey = type.toLowerCase();
    return safeMapGet(processedData.byType, typeKey) || [];
  },
  ['breweries-by-type'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get breweries by amenity with caching
 */
export const getBreweriesByAmenity = unstable_cache(
  async (amenity: string): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    const amenityKey = amenity.toLowerCase().trim();
    return safeMapGet(processedData.byAmenity, amenityKey) || [];
  },
  ['breweries-by-amenity'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get all unique cities with caching
 */
export const getAllCities = unstable_cache(
  async (): Promise<string[]> => {
    const processedData = await getProcessedBreweryData();
    return processedData.cities;
  },
  ['all-cities'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get all unique counties with caching
 */
export const getAllCounties = unstable_cache(
  async (): Promise<string[]> => {
    const processedData = await getProcessedBreweryData();
    return processedData.counties;
  },
  ['all-counties'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get all unique amenities with caching
 */
export const getAllAmenities = unstable_cache(
  async (): Promise<string[]> => {
    const processedData = await getProcessedBreweryData();
    return processedData.amenities;
  },
  ['all-amenities'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get all unique types with caching
 */
export const getAllTypes = unstable_cache(
  async (): Promise<string[]> => {
    const processedData = await getProcessedBreweryData();
    return processedData.types;
  },
  ['all-types'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get site statistics with caching
 */
export const getSiteStatistics = unstable_cache(
  async (): Promise<SiteStatistics> => {
    const processedData = await getProcessedBreweryData();
    return processedData.stats;
  },
  ['site-statistics'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Search breweries with caching
 */
export const searchBreweries = unstable_cache(
  async (query: string): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return processedData.breweries;
    
    return processedData.breweries.filter(brewery => 
      brewery.name.toLowerCase().includes(searchTerm) ||
      brewery.city.toLowerCase().includes(searchTerm) ||
      brewery.county.toLowerCase().includes(searchTerm) ||
      brewery.description?.toLowerCase().includes(searchTerm) ||
      brewery.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm))
    );
  },
  ['search-breweries'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Get nearby breweries with caching
 */
export const getNearbyBreweries = unstable_cache(
  async (latitude: number, longitude: number, radiusMiles: number = 10): Promise<Brewery[]> => {
    const processedData = await getProcessedBreweryData();
    
    return processedData.breweries.filter(brewery => {
      const distance = calculateDistance(
        latitude, longitude,
        brewery.latitude, brewery.longitude
      );
      return distance <= radiusMiles;
    }).sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  },
  ['nearby-breweries'],
  {
    tags: ['brewery-data'],
    revalidate: 60,
  }
);

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
