/**
 * Fetch Hero Images for Index Pages
 * 
 * This script fetches brewery-themed hero images for:
 * - /cities index page
 * - /counties index page
 * 
 * Usage:
 *   npx tsx scripts/fetch-index-hero-images.ts
 * 
 * Make sure to set environment variable in .env.local:
 *   - PEXELS_API_KEY (get free key from https://www.pexels.com/api/)
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
const INDEX_IMAGES_DIR = resolve(process.cwd(), 'public');

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
 * Search Pexels for brewery images
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
        await new Promise(resolve => setTimeout(resolve, 60000));
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
 * Main function
 */
async function fetchIndexHeroImages() {
  console.log('🚀 Starting index page hero images fetch from Pexels...\n');

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
    // Cities index page - brewery-themed image
    const citiesImagePath = join(INDEX_IMAGES_DIR, 'cities-hero.jpg');
    const forceRedownload = process.argv.includes('--force') || process.argv.includes('-f');

    if (!existsSync(citiesImagePath) || forceRedownload) {
      console.log('📥 Fetching brewery image for /cities index page...');
      const citiesPhoto = await searchPexels('craft brewery taproom');
      
      if (citiesPhoto) {
        const imageUrl = citiesPhoto.src.large2x || citiesPhoto.src.large || citiesPhoto.src.original;
        console.log(`   📥 Downloading image (${citiesPhoto.width}x${citiesPhoto.height})...`);
        console.log(`   📸 Photo by ${citiesPhoto.photographer}`);
        
        const success = await downloadImage(imageUrl, citiesImagePath);
        if (success) {
          console.log(`   ✓ Saved: cities-hero.jpg\n`);
        } else {
          console.log(`   ✗ Failed to download\n`);
        }
      } else {
        console.log(`   ⚠️  No image found\n`);
      }
    } else {
      console.log('⊘ Cities hero image already exists (use --force to re-download)\n');
    }

    // Counties index page - different brewery-themed image
    const countiesImagePath = join(INDEX_IMAGES_DIR, 'counties-hero.jpg');
    
    if (!existsSync(countiesImagePath) || forceRedownload) {
      console.log('📥 Fetching brewery image for /counties index page...');
      const countiesPhoto = await searchPexels('microbrewery bar');
      
      if (countiesPhoto) {
        const imageUrl = countiesPhoto.src.large2x || countiesPhoto.src.large || countiesPhoto.src.original;
        console.log(`   📥 Downloading image (${countiesPhoto.width}x${countiesPhoto.height})...`);
        console.log(`   📸 Photo by ${countiesPhoto.photographer}`);
        
        const success = await downloadImage(imageUrl, countiesImagePath);
        if (success) {
          console.log(`   ✓ Saved: counties-hero.jpg\n`);
        } else {
          console.log(`   ✗ Failed to download\n`);
        }
      } else {
        console.log(`   ⚠️  No image found\n`);
      }
    } else {
      console.log('⊘ Counties hero image already exists (use --force to re-download)\n');
    }

    console.log('✅ Done!');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
fetchIndexHeroImages();

