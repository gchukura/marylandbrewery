/**
 * Data Utility Functions for Brewery Directory
 * Utility functions for data processing, formatting, and calculations
 */

import { MARYLAND_COUNTIES } from '@/types/brewery';
import { deslugify } from '@/lib/slug';

/**
 * Maryland county names with their canonical forms (including apostrophes)
 * Maps from slug to canonical county name
 */
const COUNTY_NAME_MAP: Record<string, string> = {
  'allegany': 'Allegany',
  'anne-arundel': 'Anne Arundel',
  'baltimore': 'Baltimore',
  'baltimore-city': 'Baltimore City',
  'calvert': 'Calvert',
  'caroline': 'Caroline',
  'carroll': 'Carroll',
  'cecil': 'Cecil',
  'charles': 'Charles',
  'dorchester': 'Dorchester',
  'frederick': 'Frederick',
  'garrett': 'Garrett',
  'harford': 'Harford',
  'howard': 'Howard',
  'kent': 'Kent',
  'montgomery': 'Montgomery',
  'prince-georges': "Prince George's",
  'prince-george': "Prince George's",
  'queen-annes': "Queen Anne's",
  'queen-anne': "Queen Anne's",
  'somerset': 'Somerset',
  'st-marys': "St. Mary's",
  'st-mary': "St. Mary's",
  'saint-marys': "St. Mary's",
  'saint-mary': "St. Mary's",
  'talbot': 'Talbot',
  'washington': 'Washington',
  'wicomico': 'Wicomico',
  'worcester': 'Worcester',
};

/**
 * All valid Maryland county names (canonical forms)
 */
/**
 * Normalize county name from slug to canonical form
 * Handles apostrophes that deslugify() cannot restore
 * 
 * @param slug - County slug (e.g., "queen-annes", "prince-georges")
 * @returns Canonical county name (e.g., "Queen Anne's", "Prince George's") or null if invalid
 */
export function normalizeCountyName(slug: string): string | null {
  const slugLower = slug.toLowerCase().trim();
  
  // Check direct mapping first
  if (COUNTY_NAME_MAP[slugLower]) {
    return COUNTY_NAME_MAP[slugLower];
  }
  
  // Fallback to deslugify for counties without apostrophes
  const deslugified = deslugify(slug);
  
  // Check if deslugified name matches any valid county (case-insensitive)
  const matchingCounty = MARYLAND_COUNTIES.find(
    county => county.toLowerCase() === deslugified.toLowerCase()
  );
  
  return matchingCounty || null;
}

/**
 * Check if a county slug is valid
 */
export function isValidCountySlug(slug: string): boolean {
  return normalizeCountyName(slug) !== null;
}

