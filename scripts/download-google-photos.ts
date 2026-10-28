/**
 * Download Google Places Photos Script
 * 
 * This script:
 * 1. Fetches all breweries from Supabase
 * 2. Uses Google Places API to find Place IDs (if not stored)
 * 3. Fetches multiple photos from Place Details API
 * 4. Downloads photos, converts them to WebP and uploads them to Supabase Storage
 *    (brewery-media/photos/<slug>/<n>.webp), storing the public URLs in breweries.photos
 * 5. Updates photos array in Supabase with local paths
 * 
 * Usage:
 *   npx tsx scripts/download-google-photos.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Places API (Text Search) - for finding Place IDs
 *   - Places API (Place Details) - for fetching photos
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

import { existingObjectSizes, photoPath as mediaPhotoPath, processPhoto, publicMediaUrl, uploadIfChanged } from './lib/media';
import { getAdminClient } from '@/lib/db/client';
// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  throw new Error('Google Maps API key is required. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY in .env.local');
}

// Get admin client
const adminClient = getAdminClient();
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

const client = adminClient as NonNullable<typeof adminClient>;

const MAX_PHOTOS_PER_BREWERY = 11; // Limit number of photos to download per brewery (11 total = 10 in gallery after removing hero)

/**
 * Get photo URL from Google Places API photo reference
 */
function getPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Download an image into memory
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`  ⚠️  Failed to download image: ${response.status} ${response.statusText}`);
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(`  ⚠️  Error downloading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Place Details with photos from Google Places API
 */
async function getPlaceDetailsWithPhotos(placeId: string): Promise<Array<{ photo_reference: string; width?: number; height?: number }> | null> {
  try {
    // Request photos field
    const fields = 'photos';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result && data.result.photos) {
      return data.result.photos;
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied.';
      throw new Error(`Place Details API request denied: ${errorMsg}`);
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    console.warn(`  ⚠️  Error getting Place Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Build search query from brewery data
 */
function buildSearchQuery(brewery: { name?: string | null; city?: string | null; state?: string | null }): string {
  const parts: string[] = [];
  
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  if (brewery.city) {
    parts.push(brewery.city);
  }
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  return parts.join(', ');
}

/**
 * Find Place ID using Places API Text Search
 */
async function findPlaceId(query: string): Promise<string | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].place_id;
    }
    
    return null;
  } catch (error) {
    console.warn(`  ⚠️  Error finding Place ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to download and store photos
 */
async function downloadGooglePhotos() {
  console.log('🚀 Starting Google Places photos download...\n');
  console.log('📋 Using Places API to download photos and upload them to Supabase Storage\n');

  try {

    // Step 1: Fetch all breweries from Supabase
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, slug, name, city, state, place_id, photos')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Download photos for each brewery
    console.log('📸 Step 2: Downloading photos for each brewery...');
    console.log(`   (Rate limited to ~40 requests/second, max ${MAX_PHOTOS_PER_BREWERY} photos per brewery)\n`);
    
    let photosDownloaded = 0;
    let photosStored = 0;
    let breweriesUpdated = 0;
    let skipped = 0;
    let errorCount = 0;
    let requestDeniedError: Error | null = null;
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      const query = buildSearchQuery(brewery);
      
      console.log(`[${i + 1}/${breweries.length}] Processing: ${brewery.name}`);
      
      try {
        // Find or use stored Place ID
        let placeId: string | null = brewery.place_id || null;
        
        if (!placeId) {
          console.log(`   🔍 Finding Place ID...`);
          placeId = await findPlaceId(query);
          
          if (placeId) {
            // Store Place ID for future use
            await client
              .from('breweries')
              .update({ place_id: placeId })
              .eq('id', brewery.id);
            console.log(`   ✓ Found and stored Place ID: ${placeId}`);
          } else {
            console.log(`   ⚠️  Could not find Place ID`);
            skipped++;
            console.log('');
            continue;
          }
        } else {
          console.log(`   ✓ Using stored Place ID: ${placeId}`);
        }
        
        // Get photos from Place Details
        const photos = await getPlaceDetailsWithPhotos(placeId);
        
        if (!photos || photos.length === 0) {
          console.log(`   ⚠️  No photos available`);
          skipped++;
          console.log('');
          continue;
        }
        
        console.log(`   ✓ Found ${photos.length} photo(s) available`);
        
        // Limit number of photos to download
        const photosToDownload = photos.slice(0, MAX_PHOTOS_PER_BREWERY);
        const photoPaths: string[] = [];
        
        // Photos already in Storage for this brewery (skip re-downloading them)
        const existing = await existingObjectSizes(client, `photos/${brewery.slug}`);

        // Download, convert and upload each photo
        for (let j = 0; j < photosToDownload.length; j++) {
          const photo = photosToDownload[j];
          const objectPath = mediaPhotoPath(brewery.slug, j + 1);
          const publicUrl = publicMediaUrl(objectPath);

          if (existing.has(objectPath)) {
            console.log(`   ⊘ Photo ${j + 1} already in Storage: ${objectPath}`);
            photoPaths.push(publicUrl);
            continue;
          }

          // Get photo URL
          const photoUrl = getPhotoUrl(photo.photo_reference, 1600);

          console.log(`   📥 Downloading photo ${j + 1}/${photosToDownload.length}...`);

          const downloaded = await downloadImage(photoUrl);

          if (downloaded) {
            const processed = await processPhoto(downloaded);
            await uploadIfChanged(client, objectPath, processed.buffer, existing);
            photoPaths.push(publicUrl);
            photosDownloaded++;
            photosStored++;
            console.log(`   ✓ Uploaded: ${objectPath}`);
          } else {
            console.log(`   ✗ Failed to download photo ${j + 1}`);
          }
          
          // Small delay between downloads
          if (j < photosToDownload.length - 1) {
            await sleep(100);
          }
        }
        
        // Update photos array in database if we have new photos
        if (photoPaths.length > 0) {
          const currentPhotos = (brewery.photos as string[]) || [];
          const allPhotos = [...new Set([...currentPhotos, ...photoPaths])]; // Merge and dedupe
          
          if (JSON.stringify(currentPhotos.sort()) !== JSON.stringify(allPhotos.sort())) {
            await client
              .from('breweries')
              .update({ photos: allPhotos })
              .eq('id', brewery.id);
            
            breweriesUpdated++;
            console.log(`   ✅ Updated database with ${allPhotos.length} photo path(s)`);
          } else {
            console.log(`   ⊘ Photos already up to date`);
          }
        }
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
          requestDeniedError = error;
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  API REQUEST DENIED - Check your Google Cloud Console settings.`);
          errorCount++;
          
          if (i === 0) {
            console.error(`\n   Stopping script due to API access issues.`);
            throw error;
          }
        } else {
          console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Rate limiting: Wait 25ms between requests = 40 requests/second
      if (i < breweries.length - 1) {
        await sleep(25);
      }
      
      console.log(''); // Empty line for readability
    }
    
    if (requestDeniedError) {
      console.error(`\n❌ Script encountered API access issues.`);
      throw requestDeniedError;
    }
    
    console.log(`\n📊 Photo Download Summary:`);
    console.log(`   ✓ Photos downloaded: ${photosDownloaded}`);
    console.log(`   ✓ Photos stored: ${photosStored}`);
    console.log(`   ✓ Breweries updated: ${breweriesUpdated}`);
    console.log(`   ⊘ Skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 Photo download completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - Photos downloaded: ${photosDownloaded}`);
    console.log(`  - Photos stored: ${photosStored}`);
    console.log(`  - Breweries updated: ${breweriesUpdated}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`\n📁 Photos stored in Supabase Storage: brewery-media/photos/<slug>/<n>.webp`);

  } catch (error) {
    console.error('\n❌ Photo download failed:', error);
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Go to Google Cloud Console → APIs & Services → Library');
      console.error('2. Enable "Places API"');
      console.error('3. Go to APIs & Services → Credentials');
      console.error('4. Edit your API key and check restrictions');
      console.error('5. For server-side scripts, you may need to:');
      console.error('   - Set Application restrictions to "None" temporarily, OR');
      console.error('   - Create a separate API key for server-side use');
      console.error('6. Ensure billing is enabled (required even for free tier)');
    }
    process.exit(1);
  }
}

// Run download
downloadGooglePhotos().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

