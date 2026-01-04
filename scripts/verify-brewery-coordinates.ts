/**
 * Verify Brewery Coordinates Script
 * 
 * This script:
 * 1. Fetches a brewery from Supabase (by name or all breweries)
 * 2. Uses Google Geocoding API to get correct coordinates based on address
 * 3. Compares stored coordinates with geocoded coordinates
 * 4. Reports discrepancies
 * 
 * Usage:
 *   npx tsx scripts/verify-brewery-coordinates.ts [brewery-name]
 * 
 * Examples:
 *   npx tsx scripts/verify-brewery-coordinates.ts "Silly Yak Beer Company"
 *   npx tsx scripts/verify-brewery-coordinates.ts "Franklins Brewery"
 *   npx tsx scripts/verify-brewery-coordinates.ts  (verifies all breweries)
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';

// Check if admin client is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local');
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  throw new Error('Google Maps API key is required. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY in .env.local');
}

// Get admin client
const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

const client = adminClient as NonNullable<typeof adminClient>;

/**
 * Build address string from brewery data
 */
function buildAddress(brewery: { 
  name?: string | null; 
  street?: string | null; 
  city?: string | null; 
  state?: string | null; 
  zip?: string | null 
}): string {
  const parts: string[] = [];
  
  if (brewery.street) {
    parts.push(brewery.street);
  }
  
  if (brewery.city) {
    parts.push(brewery.city);
  }
  
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  if (brewery.zip) {
    parts.push(brewery.zip);
  }
  
  return parts.join(', ');
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geocode address using Google Geocoding API
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  ⚠️  HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Geocoding API request denied: ${data.error_message}`);
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`  ⚠️  No results found for address: ${address}`);
      return null;
    } else {
      console.warn(`  ⚠️  Geocoding API returned status: ${data.status}`);
      return null;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    console.error(`  ✗ Error geocoding address "${address}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Verify a single brewery's coordinates
 */
async function verifyBrewery(brewery: DatabaseBrewery): Promise<void> {
  console.log(`\n📍 Verifying: ${brewery.name}`);
  console.log(`   Address: ${buildAddress(brewery)}`);
  console.log(`   Stored coordinates: ${brewery.latitude}, ${brewery.longitude}`);
  
  const address = buildAddress(brewery);
  if (!address) {
    console.log(`   ⚠️  Cannot verify: No address information available`);
    return;
  }
  
  // Add brewery name to address for better accuracy
  const fullAddress = brewery.name ? `${brewery.name}, ${address}` : address;
  
  const geocoded = await geocodeAddress(fullAddress);
  
  if (!geocoded) {
    console.log(`   ⚠️  Could not geocode address`);
    return;
  }
  
  console.log(`   Geocoded coordinates: ${geocoded.lat}, ${geocoded.lng}`);
  
  const distance = calculateDistance(
    brewery.latitude,
    brewery.longitude,
    geocoded.lat,
    geocoded.lng
  );
  
  console.log(`   Distance difference: ${distance.toFixed(2)} miles`);
  
  if (distance > 0.1) {
    console.log(`   ⚠️  WARNING: Coordinates differ by more than 0.1 miles (${distance.toFixed(2)} miles)`);
    if (distance > 1) {
      console.log(`   ❌ ERROR: Coordinates differ by more than 1 mile!`);
    }
  } else {
    console.log(`   ✅ Coordinates are accurate (within 0.1 miles)`);
  }
  
  // Rate limiting - wait 100ms between requests
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Main function
 */
async function main() {
  const breweryName = process.argv[2];
  
  console.log('🔍 Brewery Coordinate Verification Script\n');
  console.log('Using Google Geocoding API to verify stored coordinates...\n');
  
  try {
    let query = client.from('breweries').select('*');
    
    if (breweryName) {
      console.log(`Searching for brewery: "${breweryName}"\n`);
      query = query.ilike('name', `%${breweryName}%`);
    } else {
      console.log('Verifying all breweries...\n');
    }
    
    const { data: breweries, error } = await query.order('name');
    
    if (error) {
      throw new Error(`Failed to fetch breweries: ${error.message}`);
    }
    
    if (!breweries || breweries.length === 0) {
      console.log('No breweries found.');
      return;
    }
    
    console.log(`Found ${breweries.length} brewery(ies) to verify.\n`);
    
    let verified = 0;
    let warnings = 0;
    let errors = 0;
    
    for (const brewery of breweries) {
      try {
        const storedLat = brewery.latitude;
        const storedLng = brewery.longitude;
        
        if (!storedLat || !storedLng) {
          console.log(`\n📍 ${brewery.name}: ⚠️  No coordinates stored`);
          continue;
        }
        
        await verifyBrewery(brewery);
        verified++;
        
        // Check distance for summary
        const address = buildAddress(brewery);
        if (address) {
          const fullAddress = brewery.name ? `${brewery.name}, ${address}` : address;
          const geocoded = await geocodeAddress(fullAddress);
          if (geocoded) {
            const distance = calculateDistance(storedLat, storedLng, geocoded.lat, geocoded.lng);
            if (distance > 1) {
              errors++;
            } else if (distance > 0.1) {
              warnings++;
            }
          }
        }
      } catch (error) {
        console.error(`\n❌ Error verifying ${brewery.name}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Total verified: ${verified}`);
    console.log(`   Warnings (>0.1 miles): ${warnings}`);
    console.log(`   Errors (>1 mile): ${errors}`);
    console.log(`\n✅ Done!\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
main();

