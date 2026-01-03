/**
 * Migrate Neighborhoods from CSV Script
 * 
 * This script:
 * 1. Reads neighborhood data from a CSV file
 * 2. Extracts city info from descriptions (since city column is often empty)
 * 3. Geocodes each neighborhood using Google Places/Geocoding API
 * 4. Inserts/updates data in Supabase neighborhoods table
 * 
 * Usage:
 *   npx tsx scripts/migrate-neighborhoods-csv.ts [path/to/file.csv]
 * 
 * Environment variables required in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Places API (Text Search)
 *   - Geocoding API
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

// Path to CSV file - adjust this to match your file location
const CSV_FILE_PATH = process.argv[2] || './maryland_neighborhoods - Sheet1.csv';

// Known Maryland cities for extraction from descriptions
const MARYLAND_CITIES = [
  'Bethesda', 'Potomac', 'Chevy Chase', 'Kensington', 'Rockville', 
  'Silver Spring', 'Gaithersburg', 'Baltimore', 'Annapolis', 'Frederick',
  'Columbia', 'Towson', 'Ellicott City', 'Bowie', 'Clarksville',
  'Salisbury', 'Ocean City', 'Germantown', 'Laurel', 'College Park',
  'Takoma Park', 'Hyattsville', 'Greenbelt', 'North Bethesda',
  'Olney', 'Wheaton', 'Aspen Hill', 'Bel Air', 'Dundalk',
  'Glen Burnie', 'Severna Park', 'Arnold', 'Crofton', 'Odenton'
];

// =============================================================================
// Validate Environment
// =============================================================================

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!googleApiKey) {
  throw new Error('Google Maps API key is required. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY');
}

// =============================================================================
// Initialize Supabase Client
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// Types
// =============================================================================

interface NeighborhoodRow {
  uuid?: string;
  name: string;
  slug: string;
  description?: string;
  city: string;
  county?: string;
  state: string;
  url?: string;
  homes_url?: string;
}

interface GeocodedNeighborhood extends NeighborhoodRow {
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
}

// =============================================================================
// CSV Parsing Functions
// =============================================================================

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++; // Skip \n in \r\n
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  // Don't forget the last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extract city from description text
 * Looks for patterns like "X in Baltimore" or "X in Bethesda"
 */
function extractCityFromDescription(name: string, description: string): string {
  if (!description) return '';
  
  // Pattern 1: "Name in City" at the start
  const inPattern = new RegExp(`${name}\\s+in\\s+(${MARYLAND_CITIES.join('|')})`, 'i');
  const inMatch = description.match(inPattern);
  if (inMatch) return inMatch[1];

  // Pattern 2: Check if description starts with "City's" or mentions city prominently
  for (const city of MARYLAND_CITIES) {
    // Check for "in City" pattern anywhere
    const cityPattern = new RegExp(`\\bin\\s+${city}\\b`, 'i');
    if (cityPattern.test(description)) {
      return city;
    }
    
    // Check for "City, MD" or "City, Maryland" pattern
    const statePattern = new RegExp(`${city},?\\s*(MD|Maryland)`, 'i');
    if (statePattern.test(description)) {
      return city;
    }
  }

  return '';
}

function fetchNeighborhoodsFromCSV(filePath: string): NeighborhoodRow[] {
  console.log(`📥 Reading neighborhoods from CSV: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);

  if (rows.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Get headers
  const headers = rows[0].map(h => h.toLowerCase().trim());
  const getIndex = (name: string) => headers.indexOf(name);

  const neighborhoods: NeighborhoodRow[] = [];
  let skippedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[getIndex('name')]?.trim();
    
    // Skip empty rows or GPT error rows
    if (!name || name.includes('[GPT ERROR]') || name.includes('Empty balance')) {
      skippedCount++;
      continue;
    }

    const description = row[getIndex('description')]?.trim() || '';
    let city = row[getIndex('city')]?.trim() || '';
    
    // Try to extract city from description if not provided
    if (!city) {
      city = extractCityFromDescription(name, description);
    }

    neighborhoods.push({
      uuid: row[getIndex('uuid')]?.trim() || undefined,
      name,
      slug: row[getIndex('slug')]?.trim() || generateSlug(name),
      description: description || undefined,
      city,
      county: row[getIndex('county')]?.trim() || undefined,
      state: row[getIndex('state')]?.trim() || 'MD',
      url: row[getIndex('url')]?.trim() || undefined,
      homes_url: row[getIndex('homes_url')]?.trim() || undefined,
    });
  }

  console.log(`   ✓ Found ${neighborhoods.length} neighborhoods (skipped ${skippedCount} invalid rows)\n`);
  return neighborhoods;
}

// =============================================================================
// Geocoding Functions
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build search query for Places API
 */
function buildSearchQuery(neighborhood: NeighborhoodRow): string {
  const parts: string[] = [neighborhood.name];
  
  if (neighborhood.city) {
    parts.push(neighborhood.city);
  }
  
  parts.push('Maryland');
  
  return parts.join(', ');
}

/**
 * Geocode using Google Places API (Text Search) - better for neighborhoods
 */
async function geocodeWithPlacesAPI(query: string): Promise<{ lat: number; lng: number; placeId: string } | null> {
  try {
    const encodedQuery = encodeURIComponent(query + ' neighborhood');
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${googleApiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
      };
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Places API request denied: ${data.error_message}`);
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    return null;
  }
}

/**
 * Fallback: Geocode using Google Geocoding API
 */
async function geocodeWithGeocodingAPI(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleApiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Geocoding API request denied: ${data.error_message}`);
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    return null;
  }
}

/**
 * Geocode a neighborhood with fallback
 */
async function geocodeNeighborhood(neighborhood: NeighborhoodRow): Promise<{ lat: number; lng: number; placeId: string | null } | null> {
  const query = buildSearchQuery(neighborhood);
  
  // Try Places API first (better for named locations)
  const placesResult = await geocodeWithPlacesAPI(query);
  if (placesResult) {
    return placesResult;
  }
  
  // Fallback to Geocoding API
  const geocodeResult = await geocodeWithGeocodingAPI(query);
  if (geocodeResult) {
    return { ...geocodeResult, placeId: null };
  }
  
  // Try without "neighborhood" suffix
  const simpleQuery = `${neighborhood.name}, ${neighborhood.city || 'Maryland'}`;
  const simpleResult = await geocodeWithGeocodingAPI(simpleQuery);
  if (simpleResult) {
    return { ...simpleResult, placeId: null };
  }
  
  return null;
}

// =============================================================================
// Supabase Functions
// =============================================================================

async function upsertNeighborhood(neighborhood: GeocodedNeighborhood): Promise<boolean> {
  const record: Record<string, any> = {
    name: neighborhood.name,
    slug: neighborhood.slug,
    description: neighborhood.description,
    city: neighborhood.city,
    county: neighborhood.county,
    state: neighborhood.state,
    url: neighborhood.url,
    homes_url: neighborhood.homes_url,
    updated_at: new Date().toISOString(),
  };

  // Include geocoding data if available (requires migration 20250104000000_add_neighborhoods_geocoding.sql)
  if (neighborhood.latitude !== null && neighborhood.longitude !== null) {
    record.latitude = neighborhood.latitude;
    record.longitude = neighborhood.longitude;
  }

  if (neighborhood.place_id) {
    record.place_id = neighborhood.place_id;
  }
  
  // Note: The table is 'maryland_neighborhoods' not 'neighborhoods'
  const { error } = await supabase
    .from('maryland_neighborhoods')
    .upsert(record, {
      onConflict: 'slug',
    });

  if (error) {
    console.error(`   ✗ Error upserting ${neighborhood.name}: ${error.message}`);
    return false;
  }
  
  return true;
}

// =============================================================================
// Main Migration Function
// =============================================================================

async function migrateNeighborhoods() {
  console.log('🚀 Starting neighborhood migration from CSV...\n');
  console.log('📋 Pipeline: CSV → Geocode → Supabase\n');

  // Resolve file path
  const filePath = path.resolve(process.cwd(), CSV_FILE_PATH);

  try {
    // Step 1: Read from CSV
    const neighborhoods = fetchNeighborhoodsFromCSV(filePath);

    // Show sample of extracted cities
    const withCity = neighborhoods.filter(n => n.city);
    console.log(`📍 Extracted cities for ${withCity.length}/${neighborhoods.length} neighborhoods\n`);

    // Step 2: Geocode each neighborhood
    console.log('🌍 Geocoding neighborhoods...');
    console.log('   (Rate limited to ~40 requests/second)\n');

    const geocodedNeighborhoods: GeocodedNeighborhood[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < neighborhoods.length; i++) {
      const neighborhood = neighborhoods[i];
      const query = buildSearchQuery(neighborhood);
      
      process.stdout.write(`[${i + 1}/${neighborhoods.length}] ${neighborhood.name}`);
      if (neighborhood.city) {
        process.stdout.write(` (${neighborhood.city})`);
      }
      process.stdout.write('\n');

      try {
        const coords = await geocodeNeighborhood(neighborhood);
        
        if (coords) {
          console.log(`   ✓ ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
          
          geocodedNeighborhoods.push({
            ...neighborhood,
            latitude: coords.lat,
            longitude: coords.lng,
            place_id: coords.placeId,
          });
          successCount++;
        } else {
          console.log(`   ⚠️  Could not geocode`);
          geocodedNeighborhoods.push({
            ...neighborhood,
            latitude: null,
            longitude: null,
            place_id: null,
          });
          errorCount++;
        }
      } catch (error) {
        console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        geocodedNeighborhoods.push({
          ...neighborhood,
          latitude: null,
          longitude: null,
          place_id: null,
        });
        errorCount++;
      }

      // Rate limiting: ~25ms between requests
      await sleep(25);
    }

    console.log(`\n📊 Geocoding Summary:`);
    console.log(`   ✓ Successfully geocoded: ${successCount}`);
    console.log(`   ⚠️  Could not geocode: ${errorCount}\n`);

    // Step 3: Insert into Supabase
    console.log('📤 Inserting into Supabase...\n');

    let insertedCount = 0;
    let insertErrorCount = 0;

    for (const neighborhood of geocodedNeighborhoods) {
      const success = await upsertNeighborhood(neighborhood);
      if (success) {
        insertedCount++;
      } else {
        insertErrorCount++;
      }
    }

    console.log(`\n📊 Supabase Summary:`);
    console.log(`   ✓ Successfully inserted/updated: ${insertedCount}`);
    console.log(`   ✗ Errors: ${insertErrorCount}\n`);

    // Step 4: Verify
    console.log('✅ Verifying migration...');
    const { count } = await supabase
      .from('maryland_neighborhoods')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✓ Total neighborhoods in Supabase: ${count}\n`);

    console.log('🎉 Migration completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Read from CSV: ${neighborhoods.length}`);
    console.log(`  - Successfully geocoded: ${successCount}`);
    console.log(`  - Inserted into Supabase: ${insertedCount}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('REQUEST_DENIED')) {
        console.error('\n💡 Troubleshooting Tips:');
        console.error('1. Go to Google Cloud Console → APIs & Services → Library');
        console.error('2. Enable "Places API" and "Geocoding API"');
        console.error('3. Check API key restrictions');
        console.error('4. Ensure billing is enabled');
      } else if (error.message.includes('CSV file not found')) {
        console.error('\n💡 Troubleshooting Tips:');
        console.error(`1. Make sure the CSV file exists at: ${CSV_FILE_PATH}`);
        console.error('2. Or pass the path as an argument: npx tsx scripts/migrate-neighborhoods-csv.ts ./path/to/file.csv');
      }
    }
    
    process.exit(1);
  }
}

// Run the migration
migrateNeighborhoods();

