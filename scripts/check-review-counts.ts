/**
 * Script to check review counts per brewery
 * Run with: npx tsx scripts/check-review-counts.ts
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
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReviewCounts() {
  try {
    // Get review counts grouped by brewery
    const { data, error } = await supabase
      .from('reviews')
      .select('brewery_id, brewery_name, id')
      .order('brewery_id');

    if (error) {
      throw error;
    }

    // Group by brewery and count
    const breweryCounts = new Map<string, { name: string; count: number; ids: string[] }>();
    
    data?.forEach((review: any) => {
      const breweryId = review.brewery_id;
      if (!breweryCounts.has(breweryId)) {
        breweryCounts.set(breweryId, {
          name: review.brewery_name || 'Unknown',
          count: 0,
          ids: []
        });
      }
      const entry = breweryCounts.get(breweryId)!;
      entry.count++;
      entry.ids.push(review.id);
    });

    // Sort by count descending
    const sorted = Array.from(breweryCounts.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);

    console.log('\n=== Review Counts by Brewery ===\n');
    console.log(`Total breweries with reviews: ${sorted.length}\n`);
    
    // Show top 20 breweries with most reviews
    console.log('Top 20 breweries by review count:');
    sorted.slice(0, 20).forEach((brewery, index) => {
      console.log(`${index + 1}. ${brewery.name} (ID: ${brewery.id}): ${brewery.count} reviews`);
    });

    // Show breweries with more than 5 reviews
    const moreThan5 = sorted.filter(b => b.count > 5);
    console.log(`\n=== Breweries with more than 5 reviews: ${moreThan5.length} ===\n`);
    moreThan5.forEach((brewery, index) => {
      console.log(`${index + 1}. ${brewery.name} (ID: ${brewery.id}): ${brewery.count} reviews`);
    });

    // Check for duplicates
    console.log('\n=== Checking for duplicate reviews ===\n');
    const duplicates = new Map<string, number>();
    data?.forEach((review: any) => {
      const key = `${review.brewery_id}|${review.review_timestamp || 0}|${(review.reviewer_name || '').toLowerCase().trim()}`;
      duplicates.set(key, (duplicates.get(key) || 0) + 1);
    });

    const duplicateEntries = Array.from(duplicates.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    console.log(`Total duplicate review keys: ${duplicateEntries.length}`);
    if (duplicateEntries.length > 0) {
      console.log('\nTop 10 most duplicated reviews:');
      duplicateEntries.slice(0, 10).forEach(([key, count], index) => {
        console.log(`${index + 1}. Key: ${key.substring(0, 80)}... - Count: ${count}`);
      });
    }

  } catch (error) {
    console.error('Error checking review counts:', error);
    process.exit(1);
  }
}

checkReviewCounts();

