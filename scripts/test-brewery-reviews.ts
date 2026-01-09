/**
 * Test script to check reviews for a specific brewery
 * Run with: npx tsx scripts/test-brewery-reviews.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBreweryReviews() {
  try {
    // Test with Rock Bottom Brewery (ID: 108)
    const breweryId = '108';
    const breweryName = 'Rock Bottom Brewery - Bethesda';

    console.log(`\n=== Testing Reviews for ${breweryName} (ID: ${breweryId}) ===\n`);

    // Get all reviews
    const { data: allReviews, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('brewery_id', breweryId)
      .order('review_timestamp', { ascending: false, nullsFirst: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Total reviews in database: ${allReviews?.length || 0}\n`);

    // Show all reviews
    allReviews?.forEach((review, index) => {
      console.log(`Review ${index + 1}:`);
      console.log(`  ID: ${review.id}`);
      console.log(`  Reviewer: ${review.reviewer_name || 'Anonymous'}`);
      console.log(`  Rating: ${review.rating || 'N/A'}`);
      console.log(`  Timestamp: ${review.review_timestamp || 0}`);
      console.log(`  Date: ${review.review_date || 'N/A'}`);
      console.log(`  Text: ${(review.review_text || '').substring(0, 100)}...`);
      console.log('');
    });

    // Test deduplication logic
    console.log('\n=== Testing Deduplication Logic ===\n');
    
    const uniqueReviewsMap = new Map<string, any>();
    
    (allReviews || []).forEach((review: any) => {
      const timestamp = review.review_timestamp || 0;
      const reviewerName = (review.reviewer_name || '').toLowerCase().trim();
      const reviewTextSnippet = (review.review_text || '').substring(0, 100).toLowerCase().trim();
      const duplicateKey = `${review.brewery_id}|${timestamp}|${reviewerName}|${reviewTextSnippet}`;
      
      console.log(`Review key: ${duplicateKey.substring(0, 80)}...`);
      
      if (!uniqueReviewsMap.has(duplicateKey)) {
        uniqueReviewsMap.set(duplicateKey, review);
        console.log(`  → Added (unique)`);
      } else {
        console.log(`  → Skipped (duplicate)`);
      }
    });

    const uniqueCount = uniqueReviewsMap.size;
    console.log(`\nUnique reviews after deduplication: ${uniqueCount}`);
    console.log(`Original count: ${allReviews?.length || 0}`);
    console.log(`Deduplicated: ${(allReviews?.length || 0) - uniqueCount}`);

    // Test pagination (first 5)
    console.log(`\n=== Testing Pagination (first 5) ===\n`);
    const paginated = Array.from(uniqueReviewsMap.values()).slice(0, 5);
    console.log(`Paginated reviews: ${paginated.length}`);
    paginated.forEach((review, index) => {
      console.log(`${index + 1}. ${review.reviewer_name || 'Anonymous'} - ${review.rating || 'N/A'} stars`);
    });

  } catch (error) {
    console.error('Error testing reviews:', error);
    process.exit(1);
  }
}

testBreweryReviews();

