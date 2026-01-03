/**
 * Fetch County Images from Pexels API
 * 
 * This script:
 * 1. Fetches all Maryland counties
 * 2. Searches Pexels API for county images using county-specific search terms
 * 3. Downloads and saves images to public/counties/
 * 
 * Usage:
 *   npx tsx scripts/fetch-county-images.ts
 *   npx tsx scripts/fetch-county-images.ts --force  (re-download existing images)
 * 
 * Make sure to set environment variable in .env.local:
 *   - PEXELS_API_KEY (get free key from https://www.pexels.com/api/)
 * 
 * Note: Pexels API is free with 200 requests/hour limit
 * 
 * The script uses county-specific search terms to find more diverse images:
 * - Tries multiple search queries per county (landmarks, cities, etc.)
 * - Avoids duplicate images by tracking seen photo IDs
 * - Falls back to generic searches if county-specific terms don't work
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
import { slugify } from '../src/lib/data-utils';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const COUNTIES_DIR = resolve(process.cwd(), 'public', 'counties');

// All Maryland counties
const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
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
 * County-specific search terms for better image diversity
 */
const COUNTY_SEARCH_TERMS: Record<string, string[]> = {
  'Allegany': ['Cumberland Maryland', 'Western Maryland mountains', 'Allegany County'],
  'Anne Arundel': ['Annapolis Maryland', 'Chesapeake Bay', 'Anne Arundel County'],
  'Baltimore': ['Baltimore city', 'Inner Harbor', 'Baltimore County'],
  'Calvert': ['Chesapeake Bay', 'Calvert Cliffs', 'Southern Maryland'],
  'Caroline': ['Eastern Shore Maryland', 'Caroline County', 'rural Maryland'],
  'Carroll': ['Westminster Maryland', 'Carroll County', 'Maryland countryside'],
  'Cecil': ['Elkton Maryland', 'Cecil County', 'northeast Maryland'],
  'Charles': ['Waldorf Maryland', 'Charles County', 'Southern Maryland'],
  'Dorchester': ['Cambridge Maryland', 'Eastern Shore', 'Dorchester County'],
  'Frederick': ['Frederick Maryland', 'Catoctin Mountains', 'Frederick County'],
  'Garrett': ['Deep Creek Lake', 'Western Maryland', 'Garrett County mountains'],
  'Harford': ['Bel Air Maryland', 'Harford County', 'northeast Maryland'],
  'Howard': ['Columbia Maryland', 'Howard County', 'central Maryland'],
  'Kent': ['Chestertown Maryland', 'Eastern Shore', 'Kent County'],
  'Montgomery': ['Bethesda Maryland', 'Rockville Maryland', 'Montgomery County'],
  'Prince Georges': ['College Park Maryland', 'Prince Georges County', 'Washington DC area'],
  'Queen Annes': ['Eastern Shore Maryland', 'Queen Annes County', 'Chesapeake Bay'],
  'Somerset': ['Princess Anne Maryland', 'Eastern Shore', 'Somerset County'],
  'St Marys': ['St Marys County', 'Leonardtown Maryland', 'Southern Maryland'],
  'Talbot': ['Easton Maryland', 'St Michaels Maryland', 'Talbot County'],
  'Washington': ['Hagerstown Maryland', 'Washington County', 'Western Maryland'],
  'Wicomico': ['Salisbury Maryland', 'Eastern Shore', 'Wicomico County'],
  'Worcester': ['Ocean City Maryland', 'Eastern Shore', 'Worcester County'],
};

/**
 * Search Pexels for county images with multiple fallback queries
 */
async function searchPexels(countyName: string, countyIndex: number): Promise<PexelsPhoto | null> {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY environment variable is not set. Get a free key from https://www.pexels.com/api/');
  }

  // Get county-specific search terms or use defaults
  const searchTerms = COUNTY_SEARCH_TERMS[countyName] || [
    `${countyName} County Maryland`,
    `${countyName} Maryland`,
    `Maryland ${countyName} County`,
  ];

  // Track seen photo IDs to avoid duplicates
  const seenPhotoIds = new Set<number>();

  for (const searchQuery of searchTerms) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`  ⚠️  Rate limit exceeded. Waiting 60 seconds...`);
          await sleep(60000);
          continue; // Try next search term
        }
        console.warn(`  ⚠️  API error for "${searchQuery}": ${response.status}`);
        continue;
      }

      const data: PexelsSearchResponse = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        // Find first photo we haven't seen yet
        for (const photo of data.photos) {
          if (!seenPhotoIds.has(photo.id)) {
            seenPhotoIds.add(photo.id);
            return photo;
          }
        }
      }
    } catch (error) {
      console.warn(`  ⚠️  Error searching "${searchQuery}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue; // Try next search term
    }
    
    // Small delay between search attempts
    await sleep(100);
  }
  
  return null;
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
 * Generate filename for county image
 */
function generateCountyImageFilename(countySlug: string): string {
  return `${countySlug}.jpg`;
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to fetch and save county images
 */
async function fetchCountyImages() {
  console.log('🚀 Starting county images fetch from Pexels...\n');

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
    // Create counties directory if it doesn't exist
    if (!existsSync(COUNTIES_DIR)) {
      await mkdir(COUNTIES_DIR, { recursive: true });
      console.log(`✓ Created directory: ${COUNTIES_DIR}\n`);
    }

    console.log(`📥 Processing ${ALL_MD_COUNTIES.length} Maryland counties\n`);

    let imagesDownloaded = 0;
    let imagesSkipped = 0;
    let imagesFailed = 0;

    // Process each county
    for (let i = 0; i < ALL_MD_COUNTIES.length; i++) {
      const county = ALL_MD_COUNTIES[i];
      const countySlug = slugify(county);
      const filename = generateCountyImageFilename(countySlug);
      const filePath = join(COUNTIES_DIR, filename);
      const imagePath = `/counties/${filename}`;

      console.log(`\n[${i + 1}/${ALL_MD_COUNTIES.length}] Processing: ${county} County`);

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

      // Search Pexels for county image with multiple search strategies
      console.log(`   🔍 Searching Pexels for ${county} County images...`);
      const photo = await searchPexels(county, i);

      if (!photo) {
        console.log(`   ⚠️  No image found for ${county} County`);
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
      if (i < ALL_MD_COUNTIES.length - 1) {
        await sleep(200); // 200ms delay = ~5 requests/second max
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✓ Downloaded: ${imagesDownloaded}`);
    console.log(`   ⊘ Skipped (already exists): ${imagesSkipped}`);
    console.log(`   ✗ Failed: ${imagesFailed}`);
    console.log(`   📁 Total counties: ${ALL_MD_COUNTIES.length}`);
    console.log('='.repeat(50));

    if (imagesDownloaded > 0) {
      console.log(`\n✅ Successfully downloaded ${imagesDownloaded} county image(s)!`);
      console.log(`   Images saved to: ${COUNTIES_DIR}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
fetchCountyImages();

