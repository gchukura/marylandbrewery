/**
 * Data Utility Functions for Brewery Directory
 * Utility functions for data processing, formatting, and calculations
 */

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert slug back to readable text
 */
export function deslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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
export const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Baltimore City', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  "Prince George's", "Queen Anne's", 'Somerset', "St. Mary's", 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

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
  const matchingCounty = ALL_MD_COUNTIES.find(
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

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

