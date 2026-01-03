/**
 * Fetch City Images from Pexels API
 * 
 * This script:
 * 1. Fetches all cities from brewery data
 * 2. Searches Pexels API for city images
 * 3. Downloads and saves images to public/cities/
 * 
 * Usage:
 *   npx tsx scripts/fetch-city-images.ts
 *   npx tsx scripts/fetch-city-images.ts --force  (re-download existing images)
 * 
 * Make sure to set environment variable in .env.local:
 *   - PEXELS_API_KEY (get free key from https://www.pexels.com/api/)
 * 
 * Note: Pexels API is free with 200 requests/hour limit
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { getBreweryDataFromSupabase } from '../lib/supabase-client';
import { slugify } from '../src/lib/data-utils';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const CITIES_DIR = resolve(process.cwd(), 'public', 'cities');

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/**
 * Search Pexels for city images
 */
async function searchPexels(query: string, cityIndex: number): Promise<PexelsPhoto | null> {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY environment variable is not set. Get a free key from https://www.pexels.com/api/');
  }

  try {
    // Search for city + "Maryland" to get more relevant results
    const searchQuery = `${query} Maryland`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`  ⚠️  Rate limit exceeded. Waiting 60 seconds...`);
        await sleep(60000);
        return searchPexels(query, cityIndex); // Retry
      }
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data: PexelsSearchResponse = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0];
    }
    
    return null;
  } catch (error) {
    console.error(`  ✗ Error searching Pexels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Download image from URL and save to file
 */
async function downloadImage(url: string, filePath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`  ⚠️  Failed to download image: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await writeFile(filePath, buffer);
    return true;
  } catch (error) {
    console.warn(`  ⚠️  Error downloading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Generate filename for city image
 */
function generateCityImageFilename(citySlug: string): string {
  return `${citySlug}.jpg`;
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to fetch and save city images
 */
async function fetchCityImages() {
  console.log('🚀 Starting city images fetch from Pexels...\n');

  if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY environment variable is not set.');
    console.log('\nTo get a free API key:');
    console.log('1. Visit https://www.pexels.com/api/');
    console.log('2. Sign up for a free account');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Add PEXELS_API_KEY=your_key_here to .env.local\n');
    process.exit(1);
  }

  try {
    // Create cities directory if it doesn't exist
    if (!existsSync(CITIES_DIR)) {
      await mkdir(CITIES_DIR, { recursive: true });
      console.log(`✓ Created directory: ${CITIES_DIR}\n`);
    }

    // Get all cities from brewery data
    console.log('📥 Fetching breweries from Supabase...');
    const breweries = await getBreweryDataFromSupabase();
    console.log(`   ✓ Found ${breweries.length} breweries`);
    
    // Extract unique cities
    const citySet = new Set<string>();
    breweries.forEach(brewery => {
      if (brewery.city && brewery.city.trim()) {
        citySet.add(brewery.city.trim());
      }
    });
    const cities = Array.from(citySet).sort();
    console.log(`   ✓ Found ${cities.length} unique cities\n`);

    let imagesDownloaded = 0;
    let imagesSkipped = 0;
    let imagesFailed = 0;

    // Process each city
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const citySlug = slugify(city);
      const filename = generateCityImageFilename(citySlug);
      const filePath = join(CITIES_DIR, filename);
      const imagePath = `/cities/${filename}`;

      console.log(`\n[${i + 1}/${cities.length}] Processing: ${city}`);

      // Check for force flag to re-download
      const forceRedownload = process.argv.includes('--force') || process.argv.includes('-f');
      
      // Skip if file already exists (unless forcing)
      if (existsSync(filePath) && !forceRedownload) {
        console.log(`   ⊘ Image already exists: ${filename} (use --force to re-download)`);
        imagesSkipped++;
        continue;
      }
      
      if (forceRedownload && existsSync(filePath)) {
        console.log(`   🔄 Force re-downloading: ${filename}`);
      }

      // Search Pexels for city image
      console.log(`   🔍 Searching Pexels for "${city} Maryland"...`);
      const photo = await searchPexels(city, i);

      if (!photo) {
        console.log(`   ⚠️  No image found for ${city}`);
        imagesFailed++;
        // Small delay before next request
        await sleep(200);
        continue;
      }

      // Use large2x for high quality (good balance of quality and file size)
      const imageUrl = photo.src.large2x || photo.src.large || photo.src.original;
      
      console.log(`   📥 Downloading image (${photo.width}x${photo.height})...`);
      console.log(`   📸 Photo by ${photo.photographer} (${photo.photographer_url})`);

      // Download and save
      const success = await downloadImage(imageUrl, filePath);

      if (success) {
        imagesDownloaded++;
        console.log(`   ✓ Saved: ${filename}`);
      } else {
        imagesFailed++;
        console.log(`   ✗ Failed to download image`);
      }

      // Rate limiting: Pexels allows 200 requests/hour
      // Add a small delay between requests to stay within limits
      if (i < cities.length - 1) {
        await sleep(200); // 200ms delay = ~5 requests/second max
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✓ Downloaded: ${imagesDownloaded}`);
    console.log(`   ⊘ Skipped (already exists): ${imagesSkipped}`);
    console.log(`   ✗ Failed: ${imagesFailed}`);
    console.log(`   📁 Total cities: ${cities.length}`);
    console.log('='.repeat(50));

    if (imagesDownloaded > 0) {
      console.log(`\n✅ Successfully downloaded ${imagesDownloaded} city image(s)!`);
      console.log(`   Images saved to: ${CITIES_DIR}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
fetchCityImages();

