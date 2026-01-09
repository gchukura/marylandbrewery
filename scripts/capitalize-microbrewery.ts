/**
 * Capitalize "microbrewery" to "Microbrewery" in breweries.type column
 *
 * This script updates all instances of "microbrewery" (lowercase) to "Microbrewery"
 * (capitalized) in the breweries table's type column.
 *
 * Usage:
 *   npx tsx scripts/capitalize-microbrewery.ts
 *   npx tsx scripts/capitalize-microbrewery.ts --dry-run
 *
 * Env required in `.env.local`:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

if (!supabaseAdmin) {
  throw new Error('Supabase admin client not available');
}

const client = supabaseAdmin;

async function capitalizeMicrobrewery() {
  console.log('🔄 Capitalizing "microbrewery" to "Microbrewery" in breweries.type\n');

  const args = process.argv.slice(2);
  const DRY_RUN = args.includes('--dry-run');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Step 1: Fetch all breweries
  console.log('📋 Step 1: Fetching all breweries...');
  const { data: breweries, error: fetchError } = await client
    .from('breweries')
    .select('id, name, type');

  if (fetchError) {
    throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
  }

  if (!breweries || breweries.length === 0) {
    console.log('   ℹ️  No breweries found');
    return;
  }

  console.log(`   ✓ Found ${breweries.length} breweries\n`);

  // Step 2: Process each brewery
  console.log('🔍 Step 2: Checking and updating type values...\n');

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errorCount = 0;

  for (const brewery of breweries) {
    processed++;
    let needsUpdate = false;
    let newType: string | string[] | null = null;

    // Handle different type formats
    if (!brewery.type) {
      skipped++;
      continue;
    }

    if (Array.isArray(brewery.type)) {
      // Type is an array
      const updatedArray = brewery.type.map((t: string) => {
        if (typeof t === 'string' && t.toLowerCase() === 'microbrewery') {
          needsUpdate = true;
          return 'Microbrewery';
        }
        return t;
      });

      if (needsUpdate) {
        newType = updatedArray;
      }
    } else if (typeof brewery.type === 'string') {
      // Type is a single string
      if (brewery.type.toLowerCase() === 'microbrewery') {
        needsUpdate = true;
        newType = 'Microbrewery';
      }
    }

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    console.log(`[${processed}/${breweries.length}] ${brewery.name}`);
    console.log(`   📝 Type: ${JSON.stringify(brewery.type)} → ${JSON.stringify(newType)}`);

    if (!DRY_RUN) {
      const { error: updateError } = await client
        .from('breweries')
        .update({ type: newType })
        .eq('id', brewery.id);

      if (updateError) {
        console.error(`   ✗ Error updating: ${updateError.message}`);
        errorCount++;
      } else {
        updated++;
        console.log(`   ✅ Updated`);
      }
    } else {
      updated++;
      console.log(`   ✅ Would update (dry run)`);
    }

    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('\n📊 Update Summary:');
  console.log(`   - Breweries processed: ${processed}`);
  console.log(`   - Breweries updated: ${updated}`);
  console.log(`   - Breweries skipped (no changes needed): ${skipped}`);
  console.log(`   - Errors: ${errorCount}`);
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no changes were made');
    console.log('   Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Update complete!');
  }
}

// Run the script
capitalizeMicrobrewery().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

