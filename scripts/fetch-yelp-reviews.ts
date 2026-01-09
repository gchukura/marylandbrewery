/**
 * Fetch Yelp Reviews Script
 * 
 * This script:
 * 1. Fetches all breweries from Supabase
 * 2. Finds/stores Yelp Business IDs for each brewery (if not already stored)
 * 3. Fetches reviews via Yelp Fusion API
 * 4. Writes reviews to Supabase reviews table (with source='yelp')
 * 5. Updates summary columns in breweries table (yelp_rating, yelp_rating_count, yelp_reviews_last_updated)
 * 
 * Usage:
 *   npx tsx scripts/fetch-yelp-reviews.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - YELP_API_KEY (get from https://www.yelp.com/developers/v3/manage_app)
 * 
 * Note: Yelp Fusion API provides up to 3 reviews per business
 * Rate limit: 5000 requests per day (free tier)
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { getBreweryDataFromSupabase } from '../lib/supabase-client';
import { 
  writeReviewsToSupabase, 
  updateYelpReviewSummaryInSupabase, 
  storeYelpBusinessIdInSupabase 
} from '../lib/supabase-client';

const yelpApiKey = process.env.YELP_API_KEY;
if (!yelpApiKey) {
  throw new Error('YELP_API_KEY is required. Please set it in .env.local. Get your API key from https://www.yelp.com/developers/v3/manage_app');
}

/**
 * Yelp Review interface matching Fusion API response
 */
interface YelpReview {
  id: string;
  rating: number;
  user: {
    id: string;
    profile_url: string;
    image_url?: string;
    name: string;
  };
  text: string;
  time_created: string; // ISO 8601 format
}

/**
 * Yelp Business Search response interface
 */
interface YelpBusinessSearchResponse {
  businesses: Array<{
    id: string;
    name: string;
    rating: number;
    review_count: number;
    location: {
      address1?: string;
      city: string;
      state: string;
      zip_code?: string;
    };
  }>;
  total: number;
}

/**
 * Yelp Business Details response interface
 */
interface YelpBusinessDetailsResponse {
  id: string;
  name: string;
  rating: number;
  review_count: number;
}

/**
 * Yelp Reviews response interface
 */
interface YelpReviewsResponse {
  reviews: YelpReview[];
  total: number;
}

/**
 * Build search query from brewery data
 */
function buildSearchQuery(brewery: { name?: string; city?: string; state?: string; street?: string }): string {
  const parts: string[] = [];
  
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  if (brewery.street) {
    parts.push(brewery.street);
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
 * Find Yelp Business ID using Yelp Fusion API Business Search
 */
async function findYelpBusinessId(
  name: string,
  location: string
): Promise<{ businessId: string; rating: number; reviewCount: number } | null> {
  try {
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}&limit=5`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Yelp API authentication failed. Check your YELP_API_KEY.');
      }
      if (response.status === 429) {
        throw new Error('Yelp API rate limit exceeded. Please try again later.');
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data: YelpBusinessSearchResponse = await response.json();
    
    if (data.businesses && data.businesses.length > 0) {
      // Try to find exact match first
      const exactMatch = data.businesses.find(b => 
        b.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      if (exactMatch) {
        console.log(`   ✓ Found exact match: "${exactMatch.name}"`);
        return {
          businessId: exactMatch.id,
          rating: exactMatch.rating,
          reviewCount: exactMatch.review_count,
        };
      }
      
      // Use first result if no exact match
      const firstResult = data.businesses[0];
      console.log(`   ℹ️  Found ${data.businesses.length} result(s), using first: "${firstResult.name}"`);
      return {
        businessId: firstResult.id,
        rating: firstResult.rating,
        reviewCount: firstResult.review_count,
      };
    }
    
    console.warn(`  ⚠️  No results found for: "${name}" in "${location}"`);
    return null;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('rate limit'))) {
      throw error; // Re-throw API errors
    }
    console.warn(`  ⚠️  Error finding Yelp Business ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Business Details from Yelp Fusion API
 */
async function getYelpBusinessDetails(businessId: string): Promise<YelpBusinessDetailsResponse | null> {
  try {
    const url = `https://api.yelp.com/v3/businesses/${businessId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Yelp API authentication failed. Check your YELP_API_KEY.');
      }
      if (response.status === 429) {
        throw new Error('Yelp API rate limit exceeded. Please try again later.');
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data: YelpBusinessDetailsResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('rate limit'))) {
      throw error; // Re-throw API errors
    }
    console.warn(`  ⚠️  Error getting Yelp Business Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Reviews from Yelp Fusion API Reviews endpoint
 * Note: Yelp Fusion API provides up to 3 reviews per business
 * 
 * Some businesses may not have reviews available, which returns 404.
 * This is normal and we should handle it gracefully.
 */
async function getYelpReviews(businessId: string): Promise<YelpReview[] | null> {
  try {
    const url = `https://api.yelp.com/v3/businesses/${businessId}/reviews`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Yelp API authentication failed. Check your YELP_API_KEY.');
      }
      if (response.status === 429) {
        throw new Error('Yelp API rate limit exceeded. Please try again later.');
      }
      if (response.status === 404) {
        // 404 means the business doesn't have reviews available or business ID is invalid
        // This is not necessarily an error - some businesses just don't have reviews
        console.warn(`   ℹ️  No reviews available for business ID: ${businessId}`);
        return [];
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data: YelpReviewsResponse = await response.json();
    return data.reviews || [];
  } catch (error) {
    if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('rate limit'))) {
      throw error; // Re-throw API errors
    }
    // For 404 errors, we already handled them above, so this shouldn't happen
    // But if it does, log it and return empty array
    if (error instanceof Error && error.message.includes('404')) {
      console.warn(`   ℹ️  No reviews available for this business`);
      return [];
    }
    console.warn(`  ⚠️  Error getting Yelp Reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Convert Yelp review to format compatible with writeReviewsToSupabase
 */
function convertYelpReviewToStandardFormat(yelpReview: YelpReview): {
  author_name: string;
  author_url: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
} {
  // Convert ISO 8601 time to relative time description
  const reviewDate = new Date(yelpReview.time_created);
  const now = new Date();
  const diffMs = now.getTime() - reviewDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let relativeTime: string;
  if (diffDays === 0) {
    relativeTime = 'today';
  } else if (diffDays === 1) {
    relativeTime = 'yesterday';
  } else if (diffDays < 7) {
    relativeTime = `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    relativeTime = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    relativeTime = `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    relativeTime = `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
  
  return {
    author_name: yelpReview.user.name,
    author_url: yelpReview.user.profile_url,
    language: 'en', // Yelp API doesn't provide language, default to 'en'
    profile_photo_url: yelpReview.user.image_url,
    rating: yelpReview.rating,
    relative_time_description: relativeTime,
    text: yelpReview.text,
    time: Math.floor(reviewDate.getTime() / 1000), // Unix timestamp
  };
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to fetch and store Yelp Reviews
 */
async function fetchYelpReviews() {
  console.log('🚀 Starting Yelp Reviews fetch...\n');
  console.log('📋 Using Yelp Fusion API to fetch reviews and store in Supabase\n');
  console.log('⚠️  Note: Yelp Fusion API provides up to 3 reviews per business\n');

  try {
    // Step 1: Fetch all breweries from Supabase
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const breweries = await getBreweryDataFromSupabase();
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Process each brewery
    console.log('🌍 Step 2: Fetching Yelp reviews for each brewery...');
    console.log('   (Rate limited to ~5 requests/second to stay within Yelp API limits)\n');
    
    let businessIdsFound = 0;
    let businessIdsStored = 0;
    let reviewsFetched = 0;
    let reviewsWritten = 0;
    let summariesUpdated = 0;
    let skipped = 0;
    let skippedRecent = 0; // Skipped because updated within last week
    let errorCount = 0;
    let authError: Error | null = null;
    
    // Calculate date threshold (7 days ago)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      
      console.log(`[${i + 1}/${breweries.length}] Processing: ${brewery.name}`);
      
      try {
        // Check if recently updated (skip if updated within last 7 days)
        const breweryData = brewery as any; // Temporary type assertion for Yelp fields
        if (breweryData.yelp_reviews_last_updated) {
          const lastUpdated = new Date(breweryData.yelp_reviews_last_updated);
          const now = new Date();
          if (lastUpdated > oneWeekAgo) {
            skippedRecent++;
            const daysAgo = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`   ⊘ Skipped (updated ${daysAgo} days ago)`);
            console.log('');
            continue;
          }
        }
        
        // Find or use stored Yelp Business ID
        let yelpBusinessId: string | null = null;
        let rating: number | null = null;
        let reviewCount: number | null = null;
        
        if (breweryData.yelp_business_id) {
          yelpBusinessId = breweryData.yelp_business_id;
          console.log(`   ✓ Using stored Yelp Business ID: ${yelpBusinessId}`);
        } else {
          // Need to find Business ID
          const location = `${brewery.city}, ${brewery.state}`;
          const searchResult = await findYelpBusinessId(brewery.name, location);
          
          if (searchResult) {
            yelpBusinessId = searchResult.businessId;
            rating = searchResult.rating;
            reviewCount = searchResult.reviewCount;
            businessIdsFound++;
            
            // Store Business ID
            await storeYelpBusinessIdInSupabase(brewery.id, yelpBusinessId);
            businessIdsStored++;
            console.log(`   ✓ Stored Yelp Business ID: ${yelpBusinessId}`);
          } else {
            console.log(`   ⚠️  Could not find Yelp Business ID`);
            skipped++;
            console.log('');
            continue;
          }
          
          // Rate limiting: Yelp allows 5000 requests/day, we'll do ~5 requests/second to be safe
          await sleep(200); // Wait 200ms between requests = 5 requests/second
        }
        
        // Fetch business details (for rating and review count)
        const businessDetails = await getYelpBusinessDetails(yelpBusinessId);
        
        if (!businessDetails) {
          console.log(`   ⚠️  Could not get Yelp Business Details`);
          skipped++;
          console.log('');
          continue;
        }
        
        // Update rating and review count from business details
        rating = businessDetails.rating;
        reviewCount = businessDetails.review_count;
        
        console.log(`   ✓ Rating: ${rating}, Reviews: ${reviewCount}`);
        
        // Fetch reviews from separate Reviews endpoint
        const reviews = await getYelpReviews(yelpBusinessId);
        
        if (reviews && reviews.length > 0) {
          const convertedReviews = reviews.map(convertYelpReviewToStandardFormat);
          await writeReviewsToSupabase(brewery.id, brewery.name, convertedReviews, 'yelp');
          reviewsWritten += convertedReviews.length;
          reviewsFetched += convertedReviews.length;
          console.log(`   ✓ Wrote ${convertedReviews.length} Yelp review(s)`);
        } else {
          // Reviews endpoint returned empty array (404 or no reviews)
          // This is normal - not all businesses have reviews available
          console.log(`   ℹ️  No reviews available (this is normal for some businesses)`);
        }
        
        // Update summary
        if (rating !== null && reviewCount !== null) {
          await updateYelpReviewSummaryInSupabase(brewery.id, rating, reviewCount);
          summariesUpdated++;
          console.log(`   ✓ Updated Yelp review summary`);
        }
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('authentication')) {
          authError = error;
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  YELP API AUTHENTICATION ERROR - Check your YELP_API_KEY.`);
          errorCount++;
          
          if (i === 0) {
            console.error(`\n   Stopping script due to authentication issues.`);
            throw error;
          }
        } else if (error instanceof Error && error.message.includes('rate limit')) {
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  YELP API RATE LIMIT EXCEEDED - Please try again later.`);
          errorCount++;
          
          if (i === 0) {
            console.error(`\n   Stopping script due to rate limit.`);
            throw error;
          }
        } else {
          console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Rate limiting: Wait 200ms between requests = 5 requests/second
      if (i < breweries.length - 1) {
        await sleep(200);
      }
      
      console.log(''); // Empty line for readability
    }
    
    if (authError) {
      console.error(`\n❌ Script encountered authentication issues.`);
      throw authError;
    }
    
    console.log(`\n📊 Yelp Reviews Summary:`);
    console.log(`   ✓ Business IDs found: ${businessIdsFound}`);
    console.log(`   ✓ Business IDs stored: ${businessIdsStored}`);
    console.log(`   ✓ Reviews fetched: ${reviewsFetched}`);
    console.log(`   ✓ Reviews written: ${reviewsWritten}`);
    console.log(`   ✓ Summaries updated: ${summariesUpdated}`);
    console.log(`   ⊘ Skipped (recent): ${skippedRecent}`);
    console.log(`   ⊘ Skipped (other): ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 Yelp Reviews fetch completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - Business IDs found: ${businessIdsFound}`);
    console.log(`  - Business IDs stored: ${businessIdsStored}`);
    console.log(`  - Reviews fetched: ${reviewsFetched}`);
    console.log(`  - Reviews written: ${reviewsWritten}`);
    console.log(`  - Summaries updated: ${summariesUpdated}`);
    console.log(`  - Skipped (recent): ${skippedRecent}`);
    console.log(`  - Skipped (other): ${skipped}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('\n❌ Yelp Reviews fetch failed:', error);
    if (error instanceof Error && error.message.includes('authentication')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Get your Yelp API key from: https://www.yelp.com/developers/v3/manage_app');
      console.error('2. Add YELP_API_KEY to your .env.local file');
      console.error('3. Make sure the API key is valid and active');
      console.error('4. Check that you have access to the Yelp Fusion API');
    }
    process.exit(1);
  }
}

// Run fetch
fetchYelpReviews().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

