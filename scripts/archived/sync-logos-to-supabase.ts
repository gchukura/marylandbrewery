/**
 * Sync Logos from Google Sheets to Supabase
 * 
 * This script updates only the logo field in Supabase with the latest values from Google Sheets.
 * Useful when you've updated logos in Google Sheets and need to sync them without a full migration.
 * 
 * Usage:
 *   npx tsx scripts/sync-logos-to-supabase.ts
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { getBreweryDataFromSheets } from '../lib/google-sheets';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncLogos() {
  console.log('🚀 Starting logo sync from Google Sheets to Supabase...\n');

  try {
    // Step 1: Fetch breweries from Google Sheets
    console.log('📥 Step 1: Fetching breweries from Google Sheets...');
    const breweries = await getBreweryDataFromSheets();
    console.log(`   ✓ Found ${breweries.length} breweries\n`);

    // Step 2: Get current breweries from Supabase
    console.log('📥 Step 2: Fetching current breweries from Supabase...');
    const { data: supabaseBreweries, error: fetchError } = await supabase
      .from('breweries')
      .select('id, name, logo');

    if (fetchError) {
      throw new Error(`Failed to fetch from Supabase: ${fetchError.message}`);
    }

    if (!supabaseBreweries || supabaseBreweries.length === 0) {
      console.log('   ⚠️  No breweries found in Supabase');
      return;
    }

    console.log(`   ✓ Found ${supabaseBreweries.length} breweries in Supabase\n`);

    // Step 3: Create a map of Google Sheets breweries by ID
    const sheetsBreweriesMap = new Map(
      breweries.map(b => [b.id, b])
    );

    // Step 4: Update logos
    console.log('📤 Step 3: Updating logos in Supabase...\n');
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const supabaseBrewery of supabaseBreweries) {
      const sheetsBrewery = sheetsBreweriesMap.get(supabaseBrewery.id);
      
      if (!sheetsBrewery) {
        console.log(`   ⚠️  Brewery ${supabaseBrewery.name} (${supabaseBrewery.id}) not found in Google Sheets`);
        skipped++;
        continue;
      }

      const newLogo = sheetsBrewery.logo?.trim() || null;
      const currentLogo = supabaseBrewery.logo?.trim() || null;

      // Skip if logo hasn't changed
      if (newLogo === currentLogo) {
        skipped++;
        continue;
      }

      try {
        const { error: updateError } = await supabase
          .from('breweries')
          .update({ logo: newLogo })
          .eq('id', supabaseBrewery.id);

        if (updateError) {
          console.error(`   ✗ Failed to update ${supabaseBrewery.name}: ${updateError.message}`);
          errors++;
        } else {
          console.log(`   ✓ Updated ${supabaseBrewery.name}: ${currentLogo || 'no logo'} → ${newLogo || 'no logo'}`);
          updated++;
        }
      } catch (error) {
        console.error(`   ✗ Error updating ${supabaseBrewery.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✓ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped (no changes): ${skipped}`);
    console.log(`   ✗ Errors: ${errors}\n`);

    console.log('🎉 Logo sync completed!');
    console.log('\n💡 Note: You may need to clear Next.js cache or wait for cache revalidation for changes to appear on the site.');

  } catch (error) {
    console.error('\n❌ Logo sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncLogos().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

