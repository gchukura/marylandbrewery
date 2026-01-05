/**
 * Fetch Region Images from Pexels API
 * 
 * This script:
 * 1. Fetches region images using Pexels API
 * 2. Uses "ocean city, md" as inspiration for search terms
 * 3. Downloads and saves images to public/regions/
 * 
 * Usage:
 *   npx tsx scripts/fetch-region-images.ts
 *   npx tsx scripts/fetch-region-images.ts --force  (re-download existing images)
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

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const REGIONS_DIR = resolve(process.cwd(), 'public', 'regions');

// Region definitions matching the app
const MARYLAND_REGIONS = [
  { slug: 'eastern-shore', name: 'Eastern Shore', searchTerms: ['ocean city maryland', 'eastern shore maryland', 'chesapeake bay maryland'] },
  { slug: 'western-maryland', name: 'Western Maryland', searchTerms: ['western maryland mountains', 'appalachian mountains maryland', 'deep creek lake maryland'] },
  { slug: 'central-maryland', name: 'Central Maryland', searchTerms: ['baltimore maryland', 'central maryland', 'maryland countryside'] },
  { slug: 'southern-maryland', name: 'Southern Maryland', searchTerms: ['southern maryland', 'chesapeake bay maryland', 'st marys county maryland'] },
  { slug: 'capital-region', name: 'Capital Region', searchTerms: ['washington dc suburbs', 'montgomery county maryland', 'bethesda maryland'] },
];

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
 * Search Pexels for region images
 */
async function searchPexels(query: string): Promise<PexelsPhoto | null> {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY environment variable is not set. Get a free key from https://www.pexels.com/api/');
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`  ⚠️  Rate limit exceeded. Waiting 60 seconds...`);
        await sleep(60000);
        return searchPexels(query); // Retry
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
 * Main function to fetch and save region images
 */
async function fetchRegionImages() {
  console.log('🚀 Starting region images fetch from Pexels...\n');

  if (!PEXELS_API_KEY) {
    console.error('❌ Error: PEXELS_API_KEY environment variable is not set.');
    console.log('\nTo get a free API key:');
    console.log('1. Visit https://www.pexels.com/api/');
    console.log('2. Sign up for a free account');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Add PEXELS_API_KEY=your_key_here to .env.local\n');
    process.exit(1);
  }

  // Ensure regions directory exists
  if (!existsSync(REGIONS_DIR)) {
    await mkdir(REGIONS_DIR, { recursive: true });
    console.log(`📁 Created directory: ${REGIONS_DIR}\n`);
  }

  const forceRedownload = process.argv.includes('--force') || process.argv.includes('-f');
  let imagesDownloaded = 0;
  let imagesSkipped = 0;
  let imagesFailed = 0;

  // Process each region
  for (let i = 0; i < MARYLAND_REGIONS.length; i++) {
    const region = MARYLAND_REGIONS[i];
    const filename = `${region.slug}.jpg`;
    const filePath = join(REGIONS_DIR, filename);

    console.log(`\n[${i + 1}/${MARYLAND_REGIONS.length}] Processing: ${region.name}`);

    // Check for force flag to re-download
    if (existsSync(filePath) && !forceRedownload) {
      console.log(`   ⊘ Image already exists: ${filename} (use --force to re-download)`);
      imagesSkipped++;
      continue;
    }
    
    if (forceRedownload && existsSync(filePath)) {
      console.log(`   🔄 Force re-downloading: ${filename}`);
    }

    // Try each search term until we find an image
    let photo: PexelsPhoto | null = null;
    for (const searchTerm of region.searchTerms) {
      console.log(`   🔍 Searching Pexels for "${searchTerm}"...`);
      photo = await searchPexels(searchTerm);
      if (photo) {
        break;
      }
      await sleep(200); // Small delay between searches
    }

    if (!photo) {
      console.log(`   ⚠️  No image found for ${region.name}`);
      imagesFailed++;
      await sleep(200);
      continue;
    }

    // Use large2x for high quality
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
    if (i < MARYLAND_REGIONS.length - 1) {
      await sleep(200);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total regions: ${MARYLAND_REGIONS.length}`);
  console.log(`   Images downloaded: ${imagesDownloaded}`);
  console.log(`   Images skipped: ${imagesSkipped}`);
  console.log(`   Images failed: ${imagesFailed}`);
  console.log('\n✅ Done!\n');
}

fetchRegionImages().catch(console.error);

