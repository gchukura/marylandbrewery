/**
 * Remove Duplicate Reviews Script
 * 
 * This script identifies and removes duplicate reviews from the Supabase reviews table.
 * Duplicates are identified by: brewery_id + review_timestamp + reviewer_name
 * 
 * For each set of duplicates, it keeps the oldest one (earliest created_at).
 * 
 * Usage:
 *   npx tsx scripts/remove-duplicate-reviews.ts
 * 
 * Options:
 *   --dry-run: Show what would be deleted without actually deleting
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getAdminClient } from '@/lib/db/client';
import type { Tables } from '@/lib/db/client';

interface DuplicateGroup {
  key: string;
  reviews: Tables<'reviews'>[];
  keepId: string;
  deleteIds: string[];
}

function getDuplicateKey(review: Tables<'reviews'>): string {
  // Same columns as the reviews unique constraint (brewery_id, source, review_timestamp, reviewer_name)
  const timestamp = review.review_timestamp || 0;
  const reviewerName = (review.reviewer_name || '').toLowerCase().trim();
  return `${review.brewery_id}|${review.source}|${timestamp}|${reviewerName}`;
}

const PAGE_SIZE = 1000; // Supabase returns at most 1,000 rows per request

async function findDuplicates(): Promise<DuplicateGroup[]> {

  console.log('📥 Fetching all reviews from Supabase...');
  
  // Fetch all reviews, a page at a time
  const allReviews: Tables<'reviews'>[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await getAdminClient()
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
    allReviews.push(...((data || []) as Tables<'reviews'>[]));
    if (!data || data.length < PAGE_SIZE) break;
  }

  if (allReviews.length === 0) {
    console.log('   ℹ️  No reviews found');
    return [];
  }

  console.log(`   ✓ Fetched ${allReviews.length} reviews\n`);

  // Group reviews by duplicate key
  const reviewMap = new Map<string, Tables<'reviews'>[]>();
  
  for (const review of allReviews) {
    const key = getDuplicateKey(review);
    if (!reviewMap.has(key)) {
      reviewMap.set(key, []);
    }
    reviewMap.get(key)!.push(review);
  }

  // Find groups with duplicates (more than 1 review)
  const duplicateGroups: DuplicateGroup[] = [];

  for (const [key, reviews] of reviewMap.entries()) {
    if (reviews.length > 1) {
      // Sort by created_at to keep the oldest one
      reviews.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      });

      const keepId = reviews[0].id;
      const deleteIds = reviews.slice(1).map(r => r.id);

      duplicateGroups.push({
        key,
        reviews,
        keepId,
        deleteIds,
      });
    }
  }

  return duplicateGroups;
}

async function removeDuplicates(dryRun: boolean = false): Promise<void> {
  console.log('🔍 Searching for duplicate reviews...\n');

  const duplicateGroups = await findDuplicates();

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicate reviews found!');
    return;
  }

  console.log(`📊 Found ${duplicateGroups.length} groups of duplicate reviews\n`);

  // Calculate totals
  let totalDuplicates = 0;
  let totalToDelete = 0;

  for (const group of duplicateGroups) {
    totalDuplicates += group.reviews.length;
    totalToDelete += group.deleteIds.length;
  }

  console.log(`📈 Summary:`);
  console.log(`   - Total duplicate groups: ${duplicateGroups.length}`);
  console.log(`   - Total duplicate reviews: ${totalDuplicates}`);
  console.log(`   - Reviews to keep: ${duplicateGroups.length}`);
  console.log(`   - Reviews to delete: ${totalToDelete}\n`);

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No reviews will be deleted\n');
    console.log('📋 Duplicate groups:');
    
    for (let i = 0; i < Math.min(10, duplicateGroups.length); i++) {
      const group = duplicateGroups[i];
      const review = group.reviews[0];
      console.log(`\n   Group ${i + 1}:`);
      console.log(`   - Brewery: ${review.brewery_name} (${review.brewery_id})`);
      console.log(`   - Reviewer: ${review.reviewer_name || 'Anonymous'}`);
      console.log(`   - Timestamp: ${review.review_timestamp || 'N/A'}`);
      console.log(`   - Duplicates: ${group.reviews.length}`);
      console.log(`   - Keeping: ${group.keepId} (created: ${review.created_at})`);
      console.log(`   - Deleting: ${group.deleteIds.join(', ')}`);
    }

    if (duplicateGroups.length > 10) {
      console.log(`\n   ... and ${duplicateGroups.length - 10} more groups`);
    }

    console.log('\n✅ Dry run complete. Run without --dry-run to delete duplicates.');
    return;
  }

  // Delete duplicates

  console.log('🗑️  Deleting duplicate reviews...\n');

  let deletedCount = 0;
  let errorCount = 0;

  // Delete in batches to avoid overwhelming the database
  const batchSize = 50;
  const allDeleteIds = duplicateGroups.flatMap(g => g.deleteIds);

  for (let i = 0; i < allDeleteIds.length; i += batchSize) {
    const batch = allDeleteIds.slice(i, i + batchSize);
    
    const { error } = await getAdminClient()
      .from('reviews')
      .delete()
      .in('id', batch);

    if (error) {
      console.error(`   ✗ Error deleting batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      errorCount += batch.length;
    } else {
      deletedCount += batch.length;
      console.log(`   ✓ Deleted batch ${Math.floor(i / batchSize) + 1} (${batch.length} reviews)`);
    }
  }

  console.log('\n📊 Final Summary:');
  console.log(`   - Duplicate groups found: ${duplicateGroups.length}`);
  console.log(`   - Reviews deleted: ${deletedCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount}`);
  }
  console.log(`   - Reviews kept: ${duplicateGroups.length}`);
  console.log('\n✅ Duplicate removal complete!');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    await removeDuplicates(dryRun);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

