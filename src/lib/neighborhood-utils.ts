/**
 * Neighborhood Utility Functions
 * 
 * Functions for parsing and validating neighborhood slugs
 * Leverages enriched neighborhood data (city field) for accurate matching
 */

import { deslugify } from '@/lib/data-utils';
import { getNeighborhoodsByCity, getNeighborhoodBySlug } from '../../lib/supabase-client';
import { DatabaseNeighborhood } from '../../lib/supabase';

/**
 * Check if a slug matches the neighborhood pattern
 * Neighborhood slugs: 4+ parts ending with -md (neighborhood + city + md)
 * Example: "edgemoor-bethesda-md" (3 parts min: neighborhood-city-md)
 * Note: Since cities can have up to 3 words, neighborhoods need at least 4 parts
 */
export function isNeighborhoodSlug(slug: string): boolean {
  const parts = slug.split('-');
  // Must have 4+ parts and end with -md
  // This ensures we don't confuse 3-word cities like "havre-de-grace" with neighborhoods
  return parts.length >= 4 && slug.endsWith('-md');
}

/**
 * Check if a slug matches the city pattern
 * City slugs: 1-3 parts, optionally ending with -md
 * Examples: "bethesda", "bethesda-md", "silver-spring", "havre-de-grace"
 */
export function isCitySlug(slug: string): boolean {
  const slugWithoutMd = slug.endsWith('-md') ? slug.substring(0, slug.length - 3) : slug;
  const partsWithoutMd = slugWithoutMd.split('-');
  // Allow up to 3-word city names (e.g., "havre-de-grace", "prince-fredericktown")
  return partsWithoutMd.length <= 3;
}

/**
 * Parse a neighborhood slug and return neighborhood data
 * 
 * Pattern: [neighborhood-slug]-[city-slug]-md
 * Example: "edgemoor-bethesda-md"
 * 
 * Uses enriched city field to verify the match
 * 
 * @param slug - The slug to parse (e.g., "edgemoor-bethesda-md")
 * @returns Neighborhood data with city info, or null if not found
 */
export async function parseNeighborhoodSlug(
  slug: string
): Promise<{ neighborhood: DatabaseNeighborhood; cityName: string; citySlug: string } | null> {
  // Validation: must match neighborhood pattern
  if (!isNeighborhoodSlug(slug)) {
    return null;
  }

  const parts = slug.split('-');
  
  // Remove 'md' from the end
  const slugWithoutMd = parts.slice(0, -1).join('-');
  
  // Strategy 1: Try simple split (assumes neighborhood-slug is different from city-slug)
  // Last part before 'md' is city slug
  const simpleCitySlug = parts[parts.length - 2];
  const simpleNeighborhoodSlug = parts.slice(0, -2).join('-');
  
  if (simpleNeighborhoodSlug && simpleCitySlug) {
    const cityName = deslugify(simpleCitySlug);
    
    // Get neighborhoods for this city
    const cityNeighborhoods = await getNeighborhoodsByCity(cityName);
    
    // Find neighborhood by slug
    const neighborhood = cityNeighborhoods.find(
      n => n.slug === simpleNeighborhoodSlug &&
           n.city?.toLowerCase() === cityName.toLowerCase()
    );
    
    if (neighborhood) {
      return { neighborhood, cityName, citySlug: simpleCitySlug };
    }
  }
  
  // Strategy 2: Try different splits - assume city slug could be 1-3 words
  // This handles cases where city name has multiple words (e.g., "silver-spring")
  for (let cityWords = 1; cityWords <= Math.min(3, parts.length - 2); cityWords++) {
    const potentialCitySlug = parts.slice(-cityWords - 1, -1).join('-');
    const potentialNeighborhoodSlug = parts.slice(0, -cityWords - 1).join('-');
    
    if (potentialNeighborhoodSlug && potentialCitySlug) {
      const potentialCityName = deslugify(potentialCitySlug);
      const cityNeighborhoods = await getNeighborhoodsByCity(potentialCityName);
      
      const foundNeighborhood = cityNeighborhoods.find(
        n => n.slug === potentialNeighborhoodSlug &&
             n.city?.toLowerCase() === potentialCityName.toLowerCase()
      );
      
      if (foundNeighborhood) {
        return { 
          neighborhood: foundNeighborhood, 
          cityName: potentialCityName, 
          citySlug: potentialCitySlug 
        };
      }
    }
  }
  
  // Strategy 3: Fallback - try matching the entire slug (minus 'md') as neighborhood slug
  // Then use the neighborhood's city field
  const fallbackNeighborhood = await getNeighborhoodBySlug(slugWithoutMd);
  if (fallbackNeighborhood && fallbackNeighborhood.city) {
    const cityName = fallbackNeighborhood.city;
    const citySlug = cityName.toLowerCase().replace(/\s+/g, '-');
    
    // Verify the slug structure matches
    if (slug.endsWith(`-${citySlug}-md`)) {
      return { 
        neighborhood: fallbackNeighborhood, 
        cityName, 
        citySlug 
      };
    }
  }
  
  return null;
}

