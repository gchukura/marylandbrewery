/**
 * Geocode Breweries Script
 * 
 * This script:
 * 1. Fetches all breweries from Supabase
 * 2. Uses Google Maps Places API (Text Search) to get accurate latitude/longitude
 * 3. Falls back to Geocoding API if Places API fails
 * 4. Updates coordinates in Supabase
 * 
 * Usage:
 *   npx tsx scripts/geocode-breweries.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Places API (Text Search) - RECOMMENDED for businesses
 *   - Geocoding API - Fallback option
 * 
 * Note: Google APIs have rate limits:
 *   - 50 requests per second
 *   - This script includes rate limiting to stay within limits
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
 * Build search query from brewery data (for Places API)
 */
function buildSearchQuery(brewery: { name?: string | null; city?: string | null; state?: string | null }): string {
  const parts: string[] = [];
  
  // Add brewery name first (most important for Places API)
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  // Add city and state for better accuracy
  if (brewery.city) {
    parts.push(brewery.city);
  }
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  return parts.join(', ');
}

/**
 * Build address string from brewery data (for Geocoding API fallback)
 */
function buildAddress(brewery: { name?: string | null; street?: string | null; city?: string | null; state?: string | null; zip?: string | null }): string {
  const parts: string[] = [];
  
  // Add brewery name for better accuracy
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  // Add street address
  if (brewery.street) {
    parts.push(brewery.street);
  }
  
  // Add city, state, zip
  const cityStateZip: string[] = [];
  if (brewery.city) cityStateZip.push(brewery.city);
  if (brewery.state) cityStateZip.push(brewery.state);
  if (brewery.zip) cityStateZip.push(brewery.zip);
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join(', ');
}

/**
 * Geocode using Places API Text Search (better for businesses)
 */
async function geocodeWithPlacesAPI(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      return null; // Will try Geocoding API as fallback
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Google Maps API quota exceeded. Please try again later.');
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied. Check API key permissions and ensure Places API is enabled.';
      throw new Error(`Places API request denied: ${errorMsg}`);
    } else {
      console.warn(`  ⚠️  Places API returned status: ${data.status}`);
      return null; // Will try Geocoding API as fallback
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error; // Re-throw to show the actual error
    }
    console.warn(`  ⚠️  Places API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null; // Will try Geocoding API as fallback
  }
}

/**
 * Geocode an address using Google Maps Geocoding API (fallback)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`  ⚠️  No results found for: ${address}`);
      return null;
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Google Maps API quota exceeded. Please try again later.');
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied. Check API key permissions and ensure Geocoding API is enabled.';
      throw new Error(`Geocoding API request denied: ${errorMsg}`);
    } else {
      console.warn(`  ⚠️  Geocoding failed with status: ${data.status} for: ${address}`);
      return null;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error; // Re-throw to show the actual error
    }
    console.error(`  ✗ Error geocoding address "${address}":`, error);
    return null;
  }
}

/**
 * Geocode with retry logic - tries Places API first, then Geocoding API
 */
async function geocodeBrewery(brewery: { name?: string | null; street?: string | null; city?: string | null; state?: string | null; zip?: string | null }, retries = 2): Promise<{ lat: number; lng: number } | null> {
  const query = buildSearchQuery(brewery);
  const address = buildAddress(brewery);
  
  // Try Places API first (better for businesses)
  let coordinates = await geocodeWithPlacesAPI(query);
  
  // If Places API fails, try Geocoding API as fallback
  if (!coordinates) {
    coordinates = await geocodeAddress(address);
  }
  
  // If still no results and we have retries left, wait and retry
  if (!coordinates && retries > 0) {
    await sleep(1000); // Wait 1 second before retry
    return geocodeBrewery(brewery, retries - 1);
  }
  
  return coordinates;
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main geocoding function
 */
async function geocodeBreweries() {
  console.log('🚀 Starting brewery geocoding...\n');
  console.log('📋 Using Places API (Text Search) with Geocoding API fallback\n');

  try {
    // Step 1: Fetch all breweries from Supabase
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, name, street, city, state, zip, latitude, longitude')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Geocode each brewery
    console.log('🌍 Step 2: Geocoding brewery addresses...');
    console.log('   (Rate limited to ~40 requests/second to stay within Google API limits)\n');
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const updates: Array<{ id: string; lat: number; lng: number }> = [];
    let requestDeniedError: Error | null = null;
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      const query = buildSearchQuery(brewery);
      const address = buildAddress(brewery);
      
      console.log(`[${i + 1}/${breweries.length}] Geocoding: ${brewery.name}`);
      console.log(`   Query: ${query}`);
      console.log(`   Address: ${address}`);
      
      try {
        const coordinates = await geocodeBrewery(brewery);
        
        if (coordinates) {
          // Check if coordinates are significantly different (more than 0.01 degrees ~= 0.6 miles)
          const latDiff = Math.abs(coordinates.lat - brewery.latitude);
          const lngDiff = Math.abs(coordinates.lng - brewery.longitude);
          const isSignificantlyDifferent = latDiff > 0.01 || lngDiff > 0.01;
          
          if (isSignificantlyDifferent) {
            console.log(`   ✓ Found coordinates: ${coordinates.lat}, ${coordinates.lng}`);
            console.log(`   📍 Previous: ${brewery.latitude}, ${brewery.longitude} (diff: ${latDiff.toFixed(4)}, ${lngDiff.toFixed(4)})`);
            updates.push({
              id: brewery.id,
              lat: coordinates.lat,
              lng: coordinates.lng,
            });
            successCount++;
          } else {
            console.log(`   ✓ Coordinates match existing values (within 0.01° tolerance)`);
            skippedCount++;
          }
        } else {
          console.log(`   ✗ Failed to geocode`);
          errorCount++;
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
          requestDeniedError = error;
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  API REQUEST DENIED - This usually means:`);
          console.error(`      1. Places API or Geocoding API is not enabled in Google Cloud Console`);
          console.error(`      2. API key restrictions are blocking server-side requests`);
          console.error(`      3. Billing is not enabled on your Google Cloud project`);
          console.error(`\n   Please check your Google Cloud Console settings.`);
          errorCount++;
          
          // Ask if user wants to continue or stop
          if (i === 0) {
            console.error(`\n   Stopping script due to API access issues.`);
            throw error;
          }
        } else {
          console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Rate limiting: Google allows 50 requests/second, we'll do ~40 to be safe
      // Wait 25ms between requests = 40 requests/second
      if (i < breweries.length - 1) {
        await sleep(25);
      }
      
      console.log(''); // Empty line for readability
    }
    
    if (requestDeniedError) {
      console.error(`\n❌ Script encountered API access issues. Please fix the following:`);
      console.error(`\n1. Enable required APIs in Google Cloud Console:`);
      console.error(`   - Places API (Text Search)`);
      console.error(`   - Geocoding API`);
      console.error(`\n2. Check API key restrictions:`);
      console.error(`   - For server-side scripts, you may need to temporarily remove restrictions`);
      console.error(`   - Or create a separate API key for server-side use`);
      console.error(`\n3. Ensure billing is enabled (required even for free tier)`);
      throw requestDeniedError;
    }
    
    console.log(`\n📊 Geocoding Summary:`);
    console.log(`   ✓ Successfully geocoded: ${successCount}`);
    console.log(`   ⊘ Skipped (no change): ${skippedCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);
    console.log(`   📝 Total to update: ${updates.length}\n`);

    // Step 3: Update coordinates in Supabase
    if (updates.length > 0) {
      console.log('📤 Step 3: Updating coordinates in Supabase...');
      
      let updatedCount = 0;
      
      for (const update of updates) {
        const { error } = await client
          .from('breweries')
          .update({
            latitude: update.lat,
            longitude: update.lng,
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`   ✗ Error updating ${update.id}:`, error.message);
        } else {
          updatedCount++;
        }
      }
      
      console.log(`   ✓ Successfully updated ${updatedCount} breweries\n`);
    } else {
      console.log('ℹ️  No updates needed - all coordinates are accurate\n');
    }

    // Step 4: Verify updates
    console.log('✅ Step 4: Verifying updates...');
    const { count } = await client
      .from('breweries')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✓ Total breweries in Supabase: ${count}\n`);

    console.log('🎉 Geocoding completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - Successfully geocoded: ${successCount}`);
    console.log(`  - Skipped (no change): ${skippedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Updated in database: ${updates.length}`);

  } catch (error) {
    console.error('\n❌ Geocoding failed:', error);
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Go to Google Cloud Console → APIs & Services → Library');
      console.error('2. Enable "Places API" and "Geocoding API"');
      console.error('3. Go to APIs & Services → Credentials');
      console.error('4. Edit your API key and check restrictions');
      console.error('5. For server-side scripts, you may need to:');
      console.error('   - Set Application restrictions to "None" temporarily, OR');
      console.error('   - Create a separate API key with IP restrictions for your server');
      console.error('6. Ensure billing is enabled (required even for free tier)');
    }
    process.exit(1);
  }
}

// Run geocoding
geocodeBreweries().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
