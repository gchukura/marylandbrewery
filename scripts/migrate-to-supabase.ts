/**
 * Migration Script: Google Sheets to Supabase
 * 
 * This script:
 * 1. Fetches all data from Google Sheets
 * 2. Transforms it to match Supabase schema
 * 3. Inserts it into Supabase
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *   - GOOGLE_SHEET_ID (for reading from Sheets)
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_PRIVATE_KEY
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules that use environment variables
import { getBreweryDataFromSheets, getBeerDataFromSheets } from '../lib/google-sheets';
import { supabaseAdmin, DatabaseBrewery, DatabaseBeer } from '../lib/supabase';
import { Brewery } from '../src/types/brewery';

// Check if admin client is available (this will trigger lazy initialization)
if (!supabaseAdmin || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for migration. Please set it in .env.local');
}

/**
 * Convert Brewery to DatabaseBrewery format
 */
function breweryToDbBrewery(brewery: Brewery): DatabaseBrewery {
  return {
    id: brewery.id,
    name: brewery.name,
    slug: brewery.slug,
    description: brewery.description,
    type: brewery.type,
    
    // Location
    street: brewery.street,
    city: brewery.city,
    state: brewery.state,
    zip: brewery.zip,
    county: brewery.county,
    latitude: brewery.latitude,
    longitude: brewery.longitude,
    
    // Contact
    phone: brewery.phone,
    website: brewery.website,
    social_media: brewery.socialMedia || {},
    
    // Hours
    hours: brewery.hours || {},
    
    // Features
    amenities: brewery.amenities || [],
    allows_visitors: brewery.allowsVisitors || false,
    offers_tours: brewery.offersTours || false,
    beer_to_go: brewery.beerToGo || false,
    has_merch: brewery.hasMerch || false,
    memberships: brewery.memberships || [],
    
    // Additional fields
    food: brewery.food,
    other_drinks: brewery.otherDrinks,
    parking: brewery.parking,
    dog_friendly: brewery.dogFriendly || false,
    outdoor_seating: brewery.outdoorSeating || false,
    logo: brewery.logo,
    featured: brewery.featured || false,
    special_events: brewery.specialEvents || [],
    awards: brewery.awards || [],
    certifications: brewery.certifications || [],
    
    // Metadata
    opened_date: brewery.openedDate,
  };
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration from Google Sheets to Supabase...\n');

  try {
    // Step 1: Fetch data from Google Sheets
    console.log('📥 Step 1: Fetching data from Google Sheets...');
    const [breweries, beerData] = await Promise.all([
      getBreweryDataFromSheets(),
      getBeerDataFromSheets(),
    ]);
    
    console.log(`   ✓ Fetched ${breweries.length} breweries`);
    console.log(`   ✓ Fetched beer data for ${Object.keys(beerData).length} breweries\n`);

    // Step 2: Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Step 2: Clearing existing data in Supabase...');
    const { error: deleteBeersError } = await supabaseAdmin.from('beers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: deleteBreweriesError } = await supabaseAdmin.from('breweries').delete().neq('id', 'temp');
    
    if (deleteBeersError && deleteBeersError.code !== 'PGRST116') {
      console.warn(`   ⚠️  Warning clearing beers: ${deleteBeersError.message}`);
    }
    if (deleteBreweriesError && deleteBreweriesError.code !== 'PGRST116') {
      console.warn(`   ⚠️  Warning clearing breweries: ${deleteBreweriesError.message}`);
    }
    console.log('   ✓ Cleared existing data\n');

    // Step 3: Transform and insert breweries
    console.log('📤 Step 3: Inserting breweries into Supabase...');
    const dbBreweries: DatabaseBrewery[] = breweries.map(breweryToDbBrewery);
    
    // Insert in batches of 100 to avoid timeout
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < dbBreweries.length; i += batchSize) {
      const batch = dbBreweries.slice(i, i + batchSize);
      const { error } = await supabaseAdmin
        .from('breweries')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`   ✗ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`   ✓ Inserted ${insertedCount}/${dbBreweries.length} breweries...`);
    }
    console.log(`   ✓ Successfully inserted ${insertedCount} breweries\n`);

    // Step 4: Transform and insert beers
    console.log('📤 Step 4: Inserting beers into Supabase...');
    const dbBeers: DatabaseBeer[] = [];
    
    for (const [breweryId, beers] of Object.entries(beerData)) {
      for (const beer of beers) {
        dbBeers.push({
          brewery_id: breweryId,
          name: beer.name,
          style: beer.style,
          abv: beer.abv,
          availability: beer.availability,
        });
      }
    }
    
    if (dbBeers.length > 0) {
      // Insert in batches
      let beerInsertedCount = 0;
      for (let i = 0; i < dbBeers.length; i += batchSize) {
        const batch = dbBeers.slice(i, i + batchSize);
        const { error } = await supabaseAdmin
          .from('beers')
          .insert(batch);
        
        if (error) {
          console.error(`   ✗ Error inserting beer batch ${Math.floor(i / batchSize) + 1}:`, error);
          // Don't throw - beers are optional
          console.warn(`   ⚠️  Continuing without this batch...`);
        } else {
          beerInsertedCount += batch.length;
          console.log(`   ✓ Inserted ${beerInsertedCount}/${dbBeers.length} beers...`);
        }
      }
      console.log(`   ✓ Successfully inserted ${beerInsertedCount} beers\n`);
    } else {
      console.log('   ℹ️  No beers to insert\n');
    }

    // Step 5: Verify migration
    console.log('✅ Step 5: Verifying migration...');
    const { count: breweryCount } = await supabaseAdmin
      .from('breweries')
      .select('*', { count: 'exact', head: true });
    
    const { count: beerCount } = await supabaseAdmin
      .from('beers')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✓ Breweries in Supabase: ${breweryCount}`);
    console.log(`   ✓ Beers in Supabase: ${beerCount}\n`);

    console.log('🎉 Migration completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Breweries migrated: ${breweries.length}`);
    console.log(`  - Beers migrated: ${dbBeers.length}`);
    console.log(`  - Breweries in Supabase: ${breweryCount}`);
    console.log(`  - Beers in Supabase: ${beerCount}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

