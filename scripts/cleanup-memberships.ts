/**
 * Cleanup Memberships Script
 * 
 * This script:
 * 1. Fetches all breweries from Supabase
 * 2. Removes `description` and `benefits` fields from all membership entries
 * 3. Keeps all membership entries (including brewers_association_of_maryland)
 * 4. Updates breweries back to Supabase
 * 
 * Usage:
 *   npx tsx scripts/cleanup-memberships.ts
 * 
 * Env required in `.env.local`:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local'
  );
}

const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error(
    'Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.'
  );
}

const client = adminClient as NonNullable<typeof adminClient>;

/**
 * Clean memberships array by removing description and benefits fields
 */
function cleanMemberships(
  currentMemberships:
    | Array<{
        name: string;
        description?: string;
        benefits?: string[];
        price?: number;
        duration?: string;
      }>
    | null
    | undefined
): Array<{ name: string; price?: number; duration?: string }> {
  if (!currentMemberships || currentMemberships.length === 0) {
    return [];
  }

  return currentMemberships.map((membership) => {
    // Keep only name, price, and duration (remove description and benefits)
    const cleaned: { name: string; price?: number; duration?: string } = {
      name: membership.name,
    };

    if (membership.price !== undefined) {
      cleaned.price = membership.price;
    }

    if (membership.duration !== undefined) {
      cleaned.duration = membership.duration;
    }

    return cleaned;
  });
}

/**
 * Main cleanup function
 */
async function cleanupMemberships() {
  console.log('🧹 Starting memberships cleanup...\n');

  try {
    // Step 1: Fetch all breweries from Supabase
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, name, memberships')
      .order('name');

    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }

    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }

    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Clean memberships for each brewery
    console.log('🧹 Step 2: Cleaning memberships (removing description and benefits)...\n');

    let updated = 0;
    let skipped = 0;
    let errorCount = 0;

    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];

      console.log(`[${i + 1}/${breweries.length}] Processing: ${brewery.name}`);

      try {
        const currentMemberships = brewery.memberships as
          | Array<{
              name: string;
              description?: string;
              benefits?: string[];
              price?: number;
              duration?: string;
            }>
          | null
          | undefined;

        const cleanedMemberships = cleanMemberships(currentMemberships);

        // Check if there are actual changes
        const hasDescriptionOrBenefits = (currentMemberships || []).some(
          (m) => m.description !== undefined || m.benefits !== undefined
        );

        if (hasDescriptionOrBenefits || JSON.stringify(currentMemberships) !== JSON.stringify(cleanedMemberships)) {
          const { error } = await client
            .from('breweries')
            .update({ memberships: cleanedMemberships })
            .eq('id', brewery.id);

          if (error) {
            console.error(`   ✗ Error updating: ${error.message}`);
            errorCount++;
          } else {
            updated++;
            const removedFields = [];
            if (hasDescriptionOrBenefits) removedFields.push('description/benefits');
            console.log(`   ✅ Cleaned memberships${removedFields.length > 0 ? ` (removed ${removedFields.join(', ')})` : ''}`);
          }
        } else {
          skipped++;
          console.log(`   ⊘ Memberships already clean`);
        }
      } catch (error) {
        console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }

      console.log(''); // Empty line for readability
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⊘ Skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 Memberships cleanup completed successfully!');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupMemberships().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

