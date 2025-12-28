/**
 * Fetch Google Reviews Script
 * 
 * This script:
 * 1. Fetches all breweries from Google Sheets
 * 2. Finds/stores Place IDs for each brewery (if not already stored)
 * 3. Fetches reviews via Place Details API
 * 4. Writes reviews to "Reviews" sheet
 * 5. Updates summary columns in main sheet (google_rating, google_rating_count, google_reviews_last_updated)
 * 
 * Usage:
 *   npx tsx scripts/fetch-google-reviews.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - GOOGLE_SHEET_ID
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_PRIVATE_KEY
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Places API (Text Search) - for finding Place IDs
 *   - Places API (Place Details) - for fetching reviews
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { getBreweryDataFromSheets } from '../lib/google-sheets';
import { writeReviewsToSheets, updateReviewSummary, storePlaceId } from '../lib/google-sheets';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  throw new Error('Google Maps API key is required. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY in .env.local');
}

/**
 * Google Review interface matching Places API response
 */
interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

/**
 * Place Details response interface
 */
interface PlaceDetailsResponse {
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
}

/**
 * Build search query from brewery data
 */
function buildSearchQuery(brewery: { name?: string; city?: string; state?: string; street?: string }): string {
  const parts: string[] = [];
  
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  // Add "brewery" to help with matching
  parts.push('brewery');
  
  if (brewery.city) {
    parts.push(brewery.city);
  }
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  return parts.join(' ');
}

/**
 * Build alternative search query without "brewery" keyword
 */
function buildSearchQueryWithoutBrewery(brewery: { name?: string; city?: string; state?: string }): string {
  const parts: string[] = [];
  
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  if (brewery.city) {
    parts.push(brewery.city);
  }
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  return parts.join(', ');
}

/**
 * Find Place ID using Places API Text Search
 * Returns null if not found, or throws an error with 'REFERER_RESTRICTION' message if API key has restrictions
 */
async function findPlaceId(query: string): Promise<string | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`  ⚠️  HTTP error ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Handle different API response statuses
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      console.log(`   ℹ️  Found ${data.results.length} result(s), using first: "${firstResult.name}"`);
      return firstResult.place_id;
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`  ⚠️  No results found for query: "${query}"`);
      return null;
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied';
      console.error(`  ✗ API request denied: ${errorMsg}`);
      
      // Check if it's a referer restriction error
      if (errorMsg.includes('referer restrictions')) {
        // Throw a special error that the calling code can catch
        const error = new Error('REFERER_RESTRICTION');
        (error as any).isRefererRestriction = true;
        (error as any).originalMessage = errorMsg;
        throw error;
      }
      
      throw new Error(`Places API request denied: ${errorMsg}`);
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error(`  ✗ API quota exceeded`);
      throw new Error('Google Maps API quota exceeded');
    } else {
      const errorMsg = data.error_message || 'Unknown error';
      console.warn(`  ⚠️  API returned status "${data.status}": ${errorMsg}`);
      return null;
    }
  } catch (error) {
    // Re-throw referer restriction errors so they can be handled specially
    if (error instanceof Error && (error as any).isRefererRestriction) {
      throw error;
    }
    if (error instanceof Error && (error.message.includes('REQUEST_DENIED') || error.message.includes('quota'))) {
      throw error; // Re-throw API errors
    }
    console.warn(`  ⚠️  Error finding Place ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Place Details with reviews from Google Places API
 */
async function getPlaceDetailsWithReviews(placeId: string): Promise<PlaceDetailsResponse | null> {
  try {
    // Request reviews, rating, and total ratings
    const fields = 'reviews,rating,user_ratings_total';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return {
        rating: data.result.rating,
        user_ratings_total: data.result.user_ratings_total,
        reviews: data.result.reviews || [],
      };
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied.';
      console.error(`  ✗ Place Details API request denied: ${errorMsg}`);
      
      // Check if it's a referer restriction error
      if (errorMsg.includes('referer restrictions')) {
        const error = new Error('REFERER_RESTRICTION');
        (error as any).isRefererRestriction = true;
        (error as any).originalMessage = errorMsg;
        throw error;
      }
      
      throw new Error(`Place Details API request denied: ${errorMsg}`);
    }
    
    return null;
  } catch (error) {
    // Re-throw referer restriction errors
    if (error instanceof Error && (error as any).isRefererRestriction) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    console.warn(`  ⚠️  Error getting Place Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to fetch and store Google Reviews
 */
async function fetchGoogleReviews() {
  console.log('🚀 Starting Google Reviews fetch...\n');
  console.log('📋 Using Places API to fetch reviews and store in Google Sheets\n');

  try {
    // Step 1: Fetch all breweries from Google Sheets
    console.log('📥 Step 1: Fetching breweries from Google Sheets...');
    const breweries = await getBreweryDataFromSheets();
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Google Sheets');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Process each brewery
    console.log('🌍 Step 2: Fetching reviews for each brewery...');
    console.log('   (Rate limited to ~40 requests/second to stay within Google API limits)\n');
    
    let placeIdsFound = 0;
    let placeIdsStored = 0;
    let reviewsFetched = 0;
    let reviewsWritten = 0;
    let summariesUpdated = 0;
    let skipped = 0;
    let skippedRecent = 0; // Skipped because updated within last week
    let errorCount = 0;
    let requestDeniedError: Error | null = null;
    let refererRestrictionErrors = 0; // Track referer restriction errors
    
    // Calculate date threshold (7 days ago)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      const query = buildSearchQuery(brewery);
      
      console.log(`[${i + 1}/${breweries.length}] Processing: ${brewery.name}`);
      console.log(`   Query: ${query}`);
      
      try {
        // Check if reviews were recently updated (within last week)
        const rawData = brewery.rawData || {};
        const lastUpdatedStr = rawData['google_reviews_last_updated'] || rawData['Google Reviews Last Updated'];
        
        if (lastUpdatedStr) {
          try {
            const lastUpdated = new Date(lastUpdatedStr.toString());
            if (!isNaN(lastUpdated.getTime()) && lastUpdated > oneWeekAgo) {
              const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
              console.log(`   ⏭️  Skipping - reviews updated ${daysSinceUpdate} day(s) ago (less than 7 days)`);
              skippedRecent++;
              skipped++;
              console.log('');
              continue;
            }
          } catch (dateError) {
            // If date parsing fails, continue with fetching reviews
            console.log(`   ℹ️  Could not parse last updated date, proceeding with fetch...`);
          }
        }
        
        // Check if Place ID already exists in rawData (from Google Sheets)
        let placeId: string | null = null;
        
        // Try different variations of the place_id column name
        const existingPlaceId = rawData['place_id'] || rawData['Place ID'] || rawData['place_id'];
        
        if (existingPlaceId && existingPlaceId.toString().trim() !== '' && existingPlaceId.toString().trim() !== 'undefined') {
          placeId = existingPlaceId.toString().trim();
          console.log(`   ✓ Using existing Place ID: ${placeId}`);
        } else {
          // Find Place ID using Text Search
          console.log(`   🔍 Finding Place ID...`);
          try {
            placeId = await findPlaceId(query);
            
            // If first search fails, try fallbacks (only if no referer restriction error)
            if (!placeId && query.includes('brewery')) {
              const fallbackQuery = buildSearchQueryWithoutBrewery({ 
                name: brewery.name, 
                city: brewery.city, 
                state: brewery.state 
              });
              console.log(`   🔍 Trying fallback search without "brewery" keyword...`);
              await sleep(25); // Small delay between API calls
              placeId = await findPlaceId(fallbackQuery);
            }
            
            // If still no results, try with street address
            if (!placeId && brewery.street && brewery.street.trim() !== '') {
              const addressQuery = `${brewery.name}, ${brewery.street}, ${brewery.city}, ${brewery.state}`;
              console.log(`   🔍 Trying search with street address...`);
              await sleep(25); // Small delay between API calls
              placeId = await findPlaceId(addressQuery);
            }
          } catch (error) {
            // Check if this is a referer restriction error
            if (error instanceof Error && (error as any).isRefererRestriction) {
              refererRestrictionErrors++;
              const originalMsg = (error as any).originalMessage || 'API keys with referer restrictions cannot be used with this API.';
              console.error(`  ✗ ${originalMsg}`);
              
              // Fail fast after first referer restriction error
              console.error(`\n❌ STOPPING: API key has referer restrictions and cannot be used for server-side scripts.`);
              console.error(`\n💡 SOLUTION:`);
              console.error(`1. Go to Google Cloud Console → APIs & Services → Credentials`);
              console.error(`2. Create a NEW API key for server-side use`);
              console.error(`3. Set "Application restrictions" to "None"`);
              console.error(`4. Set "API restrictions" to only: Places API (Text Search) and Places API (Place Details)`);
              console.error(`5. Add it to .env.local as: GOOGLE_MAPS_API_KEY=your_new_key`);
              console.error(`\nSee TROUBLESHOOTING_API_KEY_RESTRICTIONS.md for detailed instructions.\n`);
              throw new Error('API key has referer restrictions - cannot be used for server-side scripts. Please create a server-side API key without referer restrictions.');
            }
            // Re-throw other errors
            throw error;
          }
          
          if (!placeId) {
            console.log(`   ⚠️  Could not find Place ID after multiple attempts`);
            console.log(`   💡 Tip: Check if this brewery exists on Google Maps manually`);
            skipped++;
            console.log('');
            continue;
          }
          
          console.log(`   ✓ Found Place ID: ${placeId}`);
          placeIdsFound++;
          
          // Store Place ID in Google Sheets
          try {
            await storePlaceId(brewery.id, placeId);
            placeIdsStored++;
            console.log(`   ✓ Stored Place ID in Google Sheets`);
          } catch (error) {
            console.warn(`   ⚠️  Could not store Place ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Continue anyway - we can still fetch reviews
          }
        }
        
        // Get Place Details with reviews
        console.log(`   📥 Fetching reviews...`);
        let details: PlaceDetailsResponse | null = null;
        try {
          details = await getPlaceDetailsWithReviews(placeId);
        } catch (error) {
          // Check if this is a referer restriction error
          if (error instanceof Error && (error as any).isRefererRestriction) {
            refererRestrictionErrors++;
            const originalMsg = (error as any).originalMessage || 'API keys with referer restrictions cannot be used with this API.';
            console.error(`  ✗ ${originalMsg}`);
            
            // Fail fast after first referer restriction error
            console.error(`\n❌ STOPPING: API key has referer restrictions and cannot be used for server-side scripts.`);
            console.error(`\n💡 SOLUTION:`);
            console.error(`1. Go to Google Cloud Console → APIs & Services → Credentials`);
            console.error(`2. Create a NEW API key for server-side use`);
            console.error(`3. Set "Application restrictions" to "None"`);
            console.error(`4. Set "API restrictions" to only: Places API (Text Search) and Places API (Place Details)`);
            console.error(`5. Add it to .env.local as: GOOGLE_MAPS_API_KEY=your_new_key`);
            console.error(`\nSee TROUBLESHOOTING_API_KEY_RESTRICTIONS.md for detailed instructions.\n`);
            throw new Error('API key has referer restrictions - cannot be used for server-side scripts. Please create a server-side API key without referer restrictions.');
          }
          // Re-throw other errors
          throw error;
        }
        
        if (!details) {
          console.log(`   ⚠️  Could not get Place Details`);
          skipped++;
          console.log('');
          continue;
        }
        
        const reviews = details.reviews || [];
        const rating = details.rating;
        const ratingCount = details.user_ratings_total || 0;
        
        if (reviews.length === 0) {
          console.log(`   ℹ️  No reviews found for this brewery`);
          // Still update summary with rating/count if available
          if (rating !== undefined || ratingCount > 0) {
            try {
              await updateReviewSummary(brewery.id, brewery.name, rating || 0, ratingCount);
              summariesUpdated++;
              console.log(`   ✓ Updated summary (Rating: ${rating || 'N/A'}, Count: ${ratingCount})`);
            } catch (error) {
              console.warn(`   ⚠️  Could not update summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          skipped++;
          console.log('');
          continue;
        }
        
        reviewsFetched += reviews.length;
        console.log(`   ✓ Fetched ${reviews.length} reviews (Rating: ${rating || 'N/A'}, Total: ${ratingCount})`);
        
        // Write reviews to Reviews sheet
        try {
          await writeReviewsToSheets(brewery.id, brewery.name, reviews);
          reviewsWritten += reviews.length;
          console.log(`   ✓ Wrote ${reviews.length} reviews to Reviews sheet`);
        } catch (error) {
          console.error(`   ✗ Error writing reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
        
        // Update summary columns in main sheet
        try {
          await updateReviewSummary(brewery.id, brewery.name, rating || 0, ratingCount);
          summariesUpdated++;
          console.log(`   ✓ Updated summary in main sheet`);
        } catch (error) {
          console.warn(`   ⚠️  Could not update summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
          requestDeniedError = error;
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  API REQUEST DENIED - Check your Google Cloud Console settings.`);
          errorCount++;
          
          if (i === 0) {
            console.error(`\n   Stopping script due to API access issues.`);
            throw error;
          }
        } else {
          console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Rate limiting: Wait 25ms between requests = 40 requests/second
      if (i < breweries.length - 1) {
        await sleep(25);
      }
      
      console.log(''); // Empty line for readability
    }
    
    if (requestDeniedError) {
      console.error(`\n❌ Script encountered API access issues.`);
      throw requestDeniedError;
    }
    
    console.log(`\n📊 Fetch Summary:`);
    console.log(`   ✓ Place IDs found: ${placeIdsFound}`);
    console.log(`   ✓ Place IDs stored: ${placeIdsStored}`);
    console.log(`   ✓ Reviews fetched: ${reviewsFetched}`);
    console.log(`   ✓ Reviews written: ${reviewsWritten}`);
    console.log(`   ✓ Summaries updated: ${summariesUpdated}`);
    console.log(`   ⏭️  Skipped (recently updated): ${skippedRecent}`);
    console.log(`   ⊘ Skipped (other): ${skipped - skippedRecent}`);
    console.log(`   ⊘ Total skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 Google Reviews fetch completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - Place IDs found: ${placeIdsFound}`);
    console.log(`  - Place IDs stored: ${placeIdsStored}`);
    console.log(`  - Reviews fetched: ${reviewsFetched}`);
    console.log(`  - Reviews written: ${reviewsWritten}`);
    console.log(`  - Summaries updated: ${summariesUpdated}`);
    console.log(`  - Skipped (recently updated): ${skippedRecent}`);
    console.log(`  - Skipped (other): ${skipped - skippedRecent}`);
    console.log(`  - Total skipped: ${skipped}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('\n❌ Google Reviews fetch failed:', error);
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Go to Google Cloud Console → APIs & Services → Library');
      console.error('2. Enable "Places API"');
      console.error('3. Go to APIs & Services → Credentials');
      console.error('4. Edit your API key and check restrictions');
      console.error('5. For server-side scripts, you may need to:');
      console.error('   - Set Application restrictions to "None" temporarily, OR');
      console.error('   - Create a separate API key for server-side use');
      console.error('6. Ensure billing is enabled (required even for free tier)');
    }
    process.exit(1);
  }
}

// Run the script
fetchGoogleReviews().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

