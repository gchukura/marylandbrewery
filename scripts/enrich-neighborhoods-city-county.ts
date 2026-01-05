/**
 * Enrich Neighborhoods City and County Script
 * 
 * This script:
 * 1. Fetches neighborhoods from Supabase that have latitude/longitude but missing city or county
 * 2. Uses Google Reverse Geocoding API to get city and county from coordinates
 * 3. Updates the records in Supabase
 * 
 * Usage:
 *   npx tsx scripts/enrich-neighborhoods-city-county.ts
 * 
 * Environment variables required in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Geocoding API (for reverse geocoding)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

// Rate limiting: delay between API calls (ms)
const API_DELAY_MS = 50; // ~20 requests/second

// =============================================================================
// Validate Environment
// =============================================================================

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!googleApiKey) {
  throw new Error('Google Maps API key is required. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY');
}

// =============================================================================
// Initialize Supabase Client
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// Types
// =============================================================================

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  county?: string | null;
  latitude: number;
  longitude: number;
}

interface ReverseGeocodeResult {
  city: string | null;
  county: string | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reverse geocode coordinates to get city and county
 * Uses Google Geocoding API reverse geocoding
 */
async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  ⚠️  HTTP error: ${response.status} ${response.statusText}`);
      return { city: null, county: null };
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      // Parse address components to find city and county
      const result = data.results[0];
      const components = result.address_components || [];
      
      let city: string | null = null;
      let county: string | null = null;
      
      for (const component of components) {
        const types = component.types || [];
        
        // City can be: locality, sublocality_level_1, or political (for some areas)
        if (!city && (
          types.includes('locality') ||
          types.includes('sublocality_level_1') ||
          (types.includes('political') && types.includes('locality'))
        )) {
          city = component.long_name;
        }
        
        // County is typically: administrative_area_level_2
        if (!county && types.includes('administrative_area_level_2')) {
          // Remove "County" suffix if present
          county = component.long_name.replace(/\s+County$/i, '');
        }
      }
      
      // Fallback: if no city found, try to extract from formatted address
      if (!city && result.formatted_address) {
        // Try to extract city from formatted address (usually appears before state)
        const addressParts = result.formatted_address.split(',');
        if (addressParts.length >= 2) {
          // City is usually the second-to-last part before state
          const potentialCity = addressParts[addressParts.length - 2]?.trim();
          if (potentialCity && !potentialCity.match(/^\d{5}$/)) { // Not a ZIP code
            city = potentialCity;
          }
        }
      }
      
      // Special case: Baltimore City is an independent city (not part of a county)
      // If city is Baltimore and no county found, check if it's Baltimore City
      if (city && city.toLowerCase() === 'baltimore' && !county) {
        // Check if this is Baltimore City (not Baltimore County)
        // Look for indicators:
        // 1. Formatted address contains "Baltimore, MD" without "County"
        // 2. Has sublocality or neighborhood components (typical of city neighborhoods)
        const hasSublocality = components.some(c => 
          c.types?.includes('sublocality') || 
          c.types?.includes('sublocality_level_1') ||
          c.types?.includes('neighborhood')
        );
        
        const isBaltimoreCity = (
          result.formatted_address?.includes('Baltimore, MD') &&
          !result.formatted_address?.includes('Baltimore County')
        ) || hasSublocality;
        
        if (isBaltimoreCity) {
          county = 'Baltimore';
        }
      }
      
      return { city, county };
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Reverse geocoding API request denied: ${data.error_message}`);
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`  ⚠️  No results found for coordinates: ${latitude}, ${longitude}`);
      return { city: null, county: null };
    } else {
      console.warn(`  ⚠️  Reverse geocoding API returned status: ${data.status}`);
      return { city: null, county: null };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    console.error(`  ✗ Error reverse geocoding coordinates "${latitude}, ${longitude}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { city: null, county: null };
  }
}

/**
 * Update neighborhood with city and/or county
 */
async function updateNeighborhood(
  id: string,
  city: string | null,
  county: string | null
): Promise<boolean> {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  
  if (city) {
    updates.city = city;
  }
  
  if (county) {
    updates.county = county;
  }
  
  const { error } = await supabase
    .from('maryland_neighborhoods')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`   ✗ Error updating ${id}: ${error.message}`);
    return false;
  }
  
  return true;
}

// =============================================================================
// Main Function
// =============================================================================

async function enrichNeighborhoods() {
  console.log('🚀 Starting neighborhood city/county enrichment...\n');
  console.log('📋 Pipeline: Fetch neighborhoods → Reverse geocode → Update Supabase\n');

  try {
    // Step 1: Fetch neighborhoods that need enrichment
    console.log('📥 Fetching neighborhoods from Supabase...\n');
    
    const { data: neighborhoods, error: fetchError } = await supabase
      .from('maryland_neighborhoods')
      .select('id, name, slug, city, county, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .or('city.is.null,city.eq.,county.is.null,county.eq.');
    
    if (fetchError) {
      throw new Error(`Failed to fetch neighborhoods: ${fetchError.message}`);
    }
    
    if (!neighborhoods || neighborhoods.length === 0) {
      console.log('✓ No neighborhoods need enrichment (all have city and county)\n');
      return;
    }
    
    console.log(`   ✓ Found ${neighborhoods.length} neighborhoods needing enrichment\n`);
    
    // Show breakdown
    const missingCity = neighborhoods.filter(n => !n.city || n.city === '').length;
    const missingCounty = neighborhoods.filter(n => !n.county || n.county === '').length;
    const missingBoth = neighborhoods.filter(n => (!n.city || n.city === '') && (!n.county || n.county === '')).length;
    
    console.log(`   📊 Breakdown:`);
    console.log(`      - Missing city: ${missingCity}`);
    console.log(`      - Missing county: ${missingCounty}`);
    console.log(`      - Missing both: ${missingBoth}\n`);
    
    // Step 2: Reverse geocode each neighborhood
    console.log('🌍 Reverse geocoding neighborhoods...');
    console.log(`   (Rate limited to ~${Math.round(1000 / API_DELAY_MS)} requests/second)\n`);
    
    let successCount = 0;
    let cityFoundCount = 0;
    let countyFoundCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < neighborhoods.length; i++) {
      const neighborhood = neighborhoods[i] as Neighborhood;
      
      const needsCity = !neighborhood.city || neighborhood.city === '';
      const needsCounty = !neighborhood.county || neighborhood.county === '';
      
      if (!needsCity && !needsCounty) {
        skippedCount++;
        continue;
      }
      
      process.stdout.write(`[${i + 1}/${neighborhoods.length}] ${neighborhood.name}`);
      if (neighborhood.city) {
        process.stdout.write(` (city: ${neighborhood.city})`);
      }
      if (neighborhood.county) {
        process.stdout.write(` (county: ${neighborhood.county})`);
      }
      process.stdout.write('\n');
      
      try {
        const result = await reverseGeocode(neighborhood.latitude, neighborhood.longitude);
        
        let updated = false;
        const updates: { city?: string | null; county?: string | null } = {};
        
        if (needsCity && result.city) {
          updates.city = result.city;
          cityFoundCount++;
          updated = true;
          console.log(`   ✓ Found city: ${result.city}`);
        } else if (needsCity) {
          console.log(`   ⚠️  City not found`);
        }
        
        if (needsCounty && result.county) {
          updates.county = result.county;
          countyFoundCount++;
          updated = true;
          console.log(`   ✓ Found county: ${result.county}`);
        } else if (needsCounty) {
          console.log(`   ⚠️  County not found`);
        }
        
        if (updated) {
          const updateSuccess = await updateNeighborhood(
            neighborhood.id,
            updates.city || null,
            updates.county || null
          );
          
          if (updateSuccess) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        errorCount++;
      }
      
      // Rate limiting
      if (i < neighborhoods.length - 1) {
        await sleep(API_DELAY_MS);
      }
    }
    
    console.log(`\n📊 Enrichment Summary:`);
    console.log(`   ✓ Successfully updated: ${successCount}`);
    console.log(`   ✓ Cities found: ${cityFoundCount}`);
    console.log(`   ✓ Counties found: ${countyFoundCount}`);
    console.log(`   ⚠️  Skipped (already complete): ${skippedCount}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);
    
    console.log('✅ Enrichment complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error during enrichment:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// =============================================================================
// Run Script
// =============================================================================

if (require.main === module) {
  enrichNeighborhoods()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { enrichNeighborhoods };

