/**
 * Import Neighborhoods from CSV
 * 
 * This script imports neighborhood data from a CSV file into Supabase.
 * 
 * CSV format (with header row):
 * name,description,city,county,url
 * 
 * Usage:
 *   npx tsx scripts/import-neighborhoods-csv.ts neighborhoods.csv
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin } from '../lib/supabase';
import { slugify } from '../src/lib/data-utils';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Check if admin client is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local');
}

const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

// Parse CLI arguments
const args = process.argv.slice(2);
const csvFile = args[0] || 'neighborhoods.csv';
const DRY_RUN = args.includes('--dry-run');

interface NeighborhoodRow {
  name: string;
  description?: string;
  city?: string;
  county?: string;
  url?: string;
  homes_url?: string;
}

/**
 * Upsert neighborhood to Supabase
 */
async function upsertNeighborhood(neighborhood: NeighborhoodRow): Promise<boolean> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upsert: ${neighborhood.name}${neighborhood.city ? ` (${neighborhood.city})` : ''}`);
    return true;
  }
  
  if (!adminClient) {
    throw new Error('Supabase admin client not available');
  }
  
  try {
    const { error } = await adminClient
      .from('maryland_neighborhoods')
      .upsert({
        name: neighborhood.name.trim(),
        slug: slugify(neighborhood.name.trim()),
        description: neighborhood.description?.trim() || undefined,
        city: neighborhood.city?.trim() || undefined,
        county: neighborhood.county?.trim() || undefined,
        state: 'MD',
        url: neighborhood.url?.trim() || neighborhood.homes_url?.trim() || undefined,
        homes_url: neighborhood.homes_url?.trim() || neighborhood.url?.trim() || undefined,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      });
    
    if (error) {
      console.error(`  ✗ Error upserting neighborhood: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error upserting neighborhood: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📥 Import Neighborhoods from CSV');
  console.log('================================');
  console.log(`CSV File: ${csvFile}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('');
  
  try {
    // Read CSV file
    const csvContent = readFileSync(csvFile, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as NeighborhoodRow[];
    
    console.log(`📊 Found ${records.length} neighborhoods in CSV`);
    
    if (records.length === 0) {
      console.log('⚠️  No records found in CSV file.');
      return;
    }
    
    // Validate required fields
    const invalidRecords = records.filter(r => !r.name || r.name.trim().length === 0);
    if (invalidRecords.length > 0) {
      console.log(`⚠️  ${invalidRecords.length} records missing required 'name' field`);
    }
    
    // Upsert neighborhoods
    console.log(`\n💾 Importing neighborhoods...`);
    let saved = 0;
    let failed = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      if (!record.name || record.name.trim().length === 0) {
        console.log(`  ⚠️  Skipping row ${i + 1}: missing name`);
        failed++;
        continue;
      }
      
      const success = await upsertNeighborhood(record);
      if (success) {
        saved++;
        if ((i + 1) % 10 === 0) {
          console.log(`  ✓ Processed ${i + 1}/${records.length}...`);
        }
      } else {
        failed++;
      }
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`  Saved: ${saved}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total: ${records.length}`);
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.error(`\n❌ Error: File not found: ${csvFile}`);
      console.error(`\nPlease create a CSV file with the following format:`);
      console.error(`name,description,city,county,url`);
      console.error(`"Fells Point","Historic waterfront neighborhood...","Baltimore","Baltimore City","https://www.homes.com/..."`);
    } else {
      console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

// Run the script
main();

