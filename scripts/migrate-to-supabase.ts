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
import { getBreweryDataFromSheets, getBeerDataFromSheets, initializeSheetsClient } from '../lib/google-sheets';
import { supabaseAdmin, DatabaseBrewery, DatabaseBeer } from '../lib/supabase';
import { Brewery } from '../src/types/brewery';

interface DatabaseReview {
  brewery_id: string;
  brewery_name: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  review_date: string | null;
  review_timestamp: number | null;
  reviewer_url: string | null;
  profile_photo_url: string | null;
  language: string;
  fetched_at: string;
}

// Check if admin client is available (this will trigger lazy initialization)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for migration. Please set it in .env.local');
}

// Get admin client - we know it exists because we checked the env var
const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

// Type assertion: we've verified adminClient is not null above
const client = adminClient as NonNullable<typeof adminClient>;

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
    social_media: (brewery.socialMedia || {}) as Record<string, string>,
    
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
    const [breweries, beerData, reviewsData] = await Promise.all([
      getBreweryDataFromSheets(),
      getBeerDataFromSheets(),
      getReviewsDataFromSheets(),
    ]);
    
    console.log(`   ✓ Fetched ${breweries.length} breweries`);
    console.log(`   ✓ Fetched beer data for ${Object.keys(beerData).length} breweries`);
    console.log(`   ✓ Fetched ${reviewsData.length} reviews\n`);

    // Step 2: Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Step 2: Clearing existing data in Supabase...');
    const { error: deleteReviewsError } = await client.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: deleteBeersError } = await client.from('beers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: deleteBreweriesError } = await client.from('breweries').delete().neq('id', 'temp');
    
    if (deleteReviewsError && deleteReviewsError.code !== 'PGRST116') {
      console.warn(`   ⚠️  Warning clearing reviews: ${deleteReviewsError.message}`);
    }
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
      const { error } = await client
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
        const { error } = await client
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

    // Step 5: Insert reviews
    console.log('📤 Step 5: Inserting reviews into Supabase...');
    if (reviewsData.length > 0) {
      let reviewsInsertedCount = 0;
      for (let i = 0; i < reviewsData.length; i += batchSize) {
        const batch = reviewsData.slice(i, i + batchSize);
        const { error } = await client
          .from('reviews')
          .insert(batch);
        
        if (error) {
          console.error(`   ✗ Error inserting review batch ${Math.floor(i / batchSize) + 1}:`, error);
          console.warn(`   ⚠️  Continuing without this batch...`);
        } else {
          reviewsInsertedCount += batch.length;
          console.log(`   ✓ Inserted ${reviewsInsertedCount}/${reviewsData.length} reviews...`);
        }
      }
      console.log(`   ✓ Successfully inserted ${reviewsInsertedCount} reviews\n`);
    } else {
      console.log('   ℹ️  No reviews to insert\n');
    }

    // Step 6: Verify migration
    console.log('✅ Step 6: Verifying migration...');
    const { count: breweryCount } = await client
      .from('breweries')
      .select('*', { count: 'exact', head: true });
    
    const { count: beerCount } = await client
      .from('beers')
      .select('*', { count: 'exact', head: true });
    
    const { count: reviewCount } = await client
      .from('reviews')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✓ Breweries in Supabase: ${breweryCount}`);
    console.log(`   ✓ Beers in Supabase: ${beerCount}`);
    console.log(`   ✓ Reviews in Supabase: ${reviewCount}\n`);

    console.log('🎉 Migration completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Breweries migrated: ${breweries.length}`);
    console.log(`  - Beers migrated: ${dbBeers.length}`);
    console.log(`  - Reviews migrated: ${reviewsData.length}`);
    console.log(`  - Breweries in Supabase: ${breweryCount}`);
    console.log(`  - Beers in Supabase: ${beerCount}`);
    console.log(`  - Reviews in Supabase: ${reviewCount}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Fetch reviews data from Google Sheets Reviews sheet
 */
async function getReviewsDataFromSheets(): Promise<DatabaseReview[]> {
  try {
    const { sheetsClient } = await initializeSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID!;

    // Fetch data from the "Reviews" sheet
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Reviews!A:K', // All review columns
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return [];
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const reviews: DatabaseReview[] = [];

    for (const row of dataRows) {
      if (!row || row.length === 0) continue;

      reviews.push({
        brewery_id: row[0]?.toString().trim() || '',
        brewery_name: row[1]?.toString().trim() || '',
        reviewer_name: row[2]?.toString().trim() || null,
        rating: row[3] ? parseInt(row[3].toString()) : null,
        review_text: row[4]?.toString().trim() || null,
        review_date: row[5]?.toString().trim() || null,
        review_timestamp: row[6] ? parseInt(row[6].toString()) : null,
        reviewer_url: row[7]?.toString().trim() || null,
        profile_photo_url: row[8]?.toString().trim() || null,
        language: row[9]?.toString().trim() || 'en',
        fetched_at: row[10]?.toString().trim() || new Date().toISOString(),
      });
    }

    return reviews;
  } catch (error) {
    console.error('Failed to fetch reviews from Google Sheets:', error);
    // Return empty array instead of throwing - reviews are optional
    return [];
  }
}

// Run migration
migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

