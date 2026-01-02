/**
 * Scrape Maryland Neighborhoods Script (Fetch-based Alternative)
 * 
 * This script uses fetch instead of Playwright to avoid bot detection.
 * Falls back to manual extraction instructions if automated access is blocked.
 * 
 * Usage:
 *   npx tsx scripts/scrape-maryland-neighborhoods-fetch.ts
 *   npx tsx scripts/scrape-maryland-neighborhoods-fetch.ts --dry-run
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin } from '../lib/supabase';
import { slugify } from '../src/lib/data-utils';

// Check if admin client is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local');
}

const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

const BASE_URL = "https://www.homes.com/neighborhood-search/maryland/";

// Parse CLI arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

interface Neighborhood {
  name: string;
  slug: string;
  description?: string;
  city?: string;
  county?: string;
  state: string;
  url?: string;
  homes_url?: string;
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch page with realistic headers
 */
async function fetchPage(url: string, pageNumber: number = 1): Promise<string | null> {
  try {
    const fullUrl = pageNumber === 1 ? url : `${url}?page=${pageNumber}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/',
      },
    });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        console.error(`  ✗ Access denied (${response.status}). The website is blocking automated access.`);
        return null;
      }
      console.error(`  ✗ HTTP error ${response.status}: ${response.statusText}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error(`  ✗ Error fetching page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Parse neighborhoods from HTML
 */
function parseNeighborhoodsFromHTML(html: string): Neighborhood[] {
  const neighborhoods: Neighborhood[] = [];
  
  // Try to find neighborhood links and data
  // This is a basic regex approach - may need adjustment based on actual HTML structure
  
  // Look for neighborhood links
  const linkPattern = /<a[^>]*href=["']([^"']*neighborhood[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const name = match[2].trim();
    
    if (name && name.length > 2 && name.length < 100) {
      const url = href.startsWith('http') ? href : `https://www.homes.com${href}`;
      
      neighborhoods.push({
        name,
        slug: slugify(name),
        state: 'MD',
        url,
        homes_url: url,
      });
    }
  }
  
  // Also try to find structured data or JSON-LD
  const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonMatch;
  
  while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonMatch[1]);
      if (Array.isArray(jsonData)) {
        jsonData.forEach((item: any) => {
          if (item['@type'] === 'Place' || item.name) {
            const name = item.name;
            if (name && !neighborhoods.some(n => n.name === name)) {
              neighborhoods.push({
                name,
                slug: slugify(name),
                description: item.description,
                state: 'MD',
              });
            }
          }
        });
      }
    } catch (e) {
      // Not valid JSON, skip
    }
  }
  
  return neighborhoods;
}

/**
 * Upsert neighborhood to Supabase
 */
async function upsertNeighborhood(neighborhood: Neighborhood): Promise<boolean> {
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
        name: neighborhood.name,
        slug: neighborhood.slug,
        description: neighborhood.description,
        city: neighborhood.city,
        county: neighborhood.county,
        state: neighborhood.state,
        url: neighborhood.url,
        homes_url: neighborhood.homes_url,
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
  console.log('🏘️  Maryland Neighborhoods Scraper (Fetch-based)');
  console.log('==================================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Target: ${BASE_URL}`);
  console.log('');
  
  const allNeighborhoods: Neighborhood[] = [];
  let currentPage = 1;
  let consecutiveEmptyPages = 0;
  const maxEmptyPages = 3;
  const maxPages = 50; // Safety limit
  
  try {
    while (currentPage <= maxPages) {
      console.log(`\n📄 Scraping page ${currentPage}...`);
      
      const html = await fetchPage(BASE_URL, currentPage);
      
      if (!html) {
        console.log(`  ⚠️  Could not fetch page ${currentPage}`);
        consecutiveEmptyPages++;
        
        if (consecutiveEmptyPages >= maxEmptyPages) {
          console.log(`  ℹ️  Could not fetch ${maxEmptyPages} consecutive pages, stopping.`);
          break;
        }
        currentPage++;
        continue;
      }
      
      const neighborhoods = parseNeighborhoodsFromHTML(html);
      
      if (neighborhoods.length === 0) {
        consecutiveEmptyPages++;
        console.log(`  ⚠️  No neighborhoods found on page ${currentPage}`);
        
        if (consecutiveEmptyPages >= maxEmptyPages) {
          console.log(`  ℹ️  No neighborhoods found for ${maxEmptyPages} consecutive pages, stopping.`);
          break;
        }
      } else {
        consecutiveEmptyPages = 0;
        allNeighborhoods.push(...neighborhoods);
        console.log(`  ✓ Found ${neighborhoods.length} neighborhoods (total: ${allNeighborhoods.length})`);
      }
      
      // Check if there's a next page by looking for pagination indicators
      const hasNextPage = html.includes(`page=${currentPage + 1}`) || 
                        html.includes('next') || 
                        html.includes('Next');
      
      if (!hasNextPage && neighborhoods.length === 0) {
        console.log(`  ℹ️  No more pages found.`);
        break;
      }
      
      currentPage++;
      await sleep(2000); // Rate limiting
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total pages scraped: ${currentPage - 1}`);
    console.log(`  Total neighborhoods found: ${allNeighborhoods.length}`);
    
    // Deduplicate by slug
    const uniqueNeighborhoods = new Map<string, Neighborhood>();
    for (const neighborhood of allNeighborhoods) {
      if (!uniqueNeighborhoods.has(neighborhood.slug)) {
        uniqueNeighborhoods.set(neighborhood.slug, neighborhood);
      }
    }
    
    console.log(`  Unique neighborhoods: ${uniqueNeighborhoods.size}`);
    
    if (uniqueNeighborhoods.size === 0) {
      console.log(`\n⚠️  No neighborhoods were extracted.`);
      console.log(`\nThe website may be blocking automated access.`);
      console.log(`\nAlternative approaches:`);
      console.log(`1. Use browser extension to export data`);
      console.log(`2. Manually extract data and import via CSV`);
      console.log(`3. Contact homes.com for API access`);
      console.log(`4. Use a different data source`);
      return;
    }
    
    // Upsert to database
    console.log(`\n💾 Saving to database...`);
    let saved = 0;
    let failed = 0;
    
    for (const neighborhood of uniqueNeighborhoods.values()) {
      const success = await upsertNeighborhood(neighborhood);
      if (success) {
        saved++;
      } else {
        failed++;
      }
      await sleep(100); // Small delay between saves
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`  Saved: ${saved}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total unique: ${uniqueNeighborhoods.size}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
main();

