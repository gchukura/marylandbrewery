/**
 * Scrape Maryland Neighborhoods Script
 * 
 * This script:
 * 1. Scrapes all 707 neighborhoods from homes.com/maryland
 * 2. Extracts neighborhood name, description, and location data
 * 3. Stores data in Supabase maryland_neighborhoods table
 * 
 * Usage:
 *   npx tsx scripts/scrape-maryland-neighborhoods.ts
 *   npx tsx scripts/scrape-maryland-neighborhoods.ts --dry-run
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 * 
 * Required packages:
 *   - playwright (npm install playwright)
 *   - Run: npx playwright install chromium
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin } from '../lib/supabase';
import { chromium, Page } from 'playwright';
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
const HEADLESS = !args.includes('--no-headless');

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
 * Extract neighborhood data from a single neighborhood card/element
 */
async function extractNeighborhoodData(page: Page, element: any): Promise<Neighborhood | null> {
  try {
    // Try to find the neighborhood name
    const nameElement = await element.$('h2, h3, .neighborhood-name, [class*="name"], [class*="title"');
    const name = nameElement ? await nameElement.textContent() : null;
    
    if (!name || !name.trim()) {
      // Try alternative selectors
      const altName = await element.textContent();
      if (!altName || altName.trim().length < 3) {
        return null;
      }
      // Use first line as name if no heading found
      const lines = altName.trim().split('\n');
      const extractedName = lines[0].trim();
      if (extractedName.length < 3) return null;
      
      return {
        name: extractedName,
        slug: slugify(extractedName),
        state: 'MD',
      };
    }
    
    // Try to find description
    let description: string | undefined;
    const descSelectors = [
      'p',
      '.description',
      '[class*="description"]',
      '[class*="desc"]',
      '.summary',
      '[class*="summary"]',
    ];
    
    for (const selector of descSelectors) {
      const descElement = await element.$(selector);
      if (descElement) {
        const descText = await descElement.textContent();
        if (descText && descText.trim().length > 20) {
          description = descText.trim();
          break;
        }
      }
    }
    
    // Try to find location info (city, county)
    let city: string | undefined;
    let county: string | undefined;
    
    const locationSelectors = [
      '[class*="city"]',
      '[class*="location"]',
      '[class*="address"]',
      '.city',
      '.location',
    ];
    
    for (const selector of locationSelectors) {
      const locElement = await element.$(selector);
      if (locElement) {
        const locText = await locElement.textContent();
        if (locText) {
          // Try to extract city and county from location text
          const cityMatch = locText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*MD/i);
          if (cityMatch) {
            city = cityMatch[1].trim();
          }
          break;
        }
      }
    }
    
    // Try to find link
    let url: string | undefined;
    const linkElement = await element.$('a[href]');
    if (linkElement) {
      const href = await linkElement.getAttribute('href');
      if (href) {
        url = href.startsWith('http') ? href : `https://www.homes.com${href}`;
      }
    }
    
    return {
      name: name.trim(),
      slug: slugify(name.trim()),
      description: description || undefined,
      city,
      county,
      state: 'MD',
      url,
      homes_url: url,
    };
  } catch (error) {
    console.warn(`  ⚠️  Error extracting neighborhood data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Scrape a single page of neighborhoods
 */
async function scrapePage(page: Page, pageNumber: number = 1): Promise<Neighborhood[]> {
  const neighborhoods: Neighborhood[] = [];
  
  try {
    // Navigate to the page
    const url = pageNumber === 1 ? BASE_URL : `${BASE_URL}?page=${pageNumber}`;
    console.log(`  📄 Loading page ${pageNumber}...`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await sleep(3000); // Wait for content to load
      
      // Wait for potential dynamic content
      try {
        await page.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        // Continue anyway
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('net::ERR_')) {
        console.error(`  ✗ Network error: ${error.message}`);
        console.log(`  ℹ️  This might be due to the website blocking automated access.`);
        console.log(`  ℹ️  Try running with headless: false to see what's happening.`);
        throw error;
      }
      throw error;
    }
    
    // Try multiple selectors for neighborhood cards
    const cardSelectors = [
      '.neighborhood-card',
      '.neighborhood-item',
      '[class*="neighborhood"]',
      '.listing-card',
      '.property-card',
      'article',
      '[data-testid*="neighborhood"]',
      'li[class*="neighborhood"]',
      '.card',
    ];
    
    let elements: any[] = [];
    for (const selector of cardSelectors) {
      try {
        const found = await page.$$(selector);
        if (found.length > 0) {
          console.log(`  ✓ Found ${found.length} neighborhoods using selector: ${selector}`);
          elements = found;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // If no specific selector works, try to find all potential neighborhood containers
    if (elements.length === 0) {
      // Try to find by common patterns
      const allLinks = await page.$$('a[href*="neighborhood"]');
      if (allLinks.length > 0) {
        console.log(`  ℹ️  Found ${allLinks.length} neighborhood links, extracting...`);
        // Extract from parent elements
        for (const link of allLinks) {
          const parent = await link.evaluateHandle((el) => el.closest('div, article, li, section'));
          if (parent) {
            elements.push(parent);
          }
        }
      }
    }
    
    // If still no elements, try a more generic approach
    if (elements.length === 0) {
      // Get page HTML and try to parse it
      const html = await page.content();
      console.log(`  ⚠️  No neighborhood cards found, trying alternative extraction...`);
      
      // Try to extract from HTML directly
      const neighborhoodMatches = html.match(/<[^>]*neighborhood[^>]*>[\s\S]*?<\/[^>]*>/gi);
      if (neighborhoodMatches) {
        console.log(`  ℹ️  Found ${neighborhoodMatches.length} potential neighborhood elements in HTML`);
      }
      
      // Try to find all list items or cards
      const genericElements = await page.$$('li, div[class*="card"], article, section');
      if (genericElements.length > 0) {
        console.log(`  ℹ️  Trying ${genericElements.length} generic elements...`);
        elements = genericElements.slice(0, 50); // Limit to avoid too many
      }
    }
    
    // Extract data from each element
    for (let i = 0; i < elements.length; i++) {
      try {
        const neighborhood = await extractNeighborhoodData(page, elements[i]);
        if (neighborhood && neighborhood.name) {
          neighborhoods.push(neighborhood);
        }
      } catch (error) {
        console.warn(`  ⚠️  Error processing element ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log(`  ✓ Extracted ${neighborhoods.length} neighborhoods from page ${pageNumber}`);
    
  } catch (error) {
    console.error(`  ✗ Error scraping page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return neighborhoods;
}

/**
 * Check if there's a next page
 */
async function hasNextPage(page: Page): Promise<boolean> {
  try {
    // Common pagination selectors
    const nextSelectors = [
      'a[aria-label*="next" i]',
      'a[aria-label*="Next" i]',
      'button[aria-label*="next" i]',
      '.pagination a:has-text("Next")',
      '.pagination-next',
      'a.pagination__next',
      'a[href*="page="]:has-text("Next")',
      '.next-page',
    ];
    
    for (const selector of nextSelectors) {
      try {
        const nextButton = await page.$(selector);
        if (nextButton) {
          const isVisible = await nextButton.isVisible();
          const isDisabled = await nextButton.evaluate((el) => {
            return el.hasAttribute('disabled') || 
                   el.classList.contains('disabled') ||
                   el.getAttribute('aria-disabled') === 'true';
          });
          
          if (isVisible && !isDisabled) {
            return true;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // Check if current page number is less than total pages
    const pageInfo = await page.textContent('.pagination, [class*="pagination"]');
    if (pageInfo) {
      const pageMatch = pageInfo.match(/page\s+(\d+)\s+of\s+(\d+)/i);
      if (pageMatch) {
        const currentPage = parseInt(pageMatch[1]);
        const totalPages = parseInt(pageMatch[2]);
        return currentPage < totalPages;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Navigate to next page
 */
async function goToNextPage(page: Page, currentPage: number): Promise<boolean> {
  try {
    const nextSelectors = [
      'a[aria-label*="next" i]',
      'a[aria-label*="Next" i]',
      'button[aria-label*="next" i]',
      '.pagination a:has-text("Next")',
      '.pagination-next',
      'a.pagination__next',
      `a[href*="page=${currentPage + 1}"]`,
    ];
    
    for (const selector of nextSelectors) {
      try {
        const nextButton = await page.$(selector);
        if (nextButton) {
          const isVisible = await nextButton.isVisible();
          const isDisabled = await nextButton.evaluate((el) => {
            return el.hasAttribute('disabled') || 
                   el.classList.contains('disabled') ||
                   el.getAttribute('aria-disabled') === 'true';
          });
          
          if (isVisible && !isDisabled) {
            await nextButton.click();
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            await sleep(2000);
            return true;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // Try direct URL navigation
    const nextUrl = `${BASE_URL}?page=${currentPage + 1}`;
    try {
      await page.goto(nextUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(2000);
      return true;
    } catch (e) {
      return false;
    }
  } catch (error) {
    return false;
  }
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
  console.log('🏘️  Maryland Neighborhoods Scraper');
  console.log('================================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Headless: ${HEADLESS}`);
  console.log(`Target: ${BASE_URL}`);
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: HEADLESS,
    args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    },
  });
  const page = await context.newPage();
  
  // Remove webdriver property to avoid detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  
  const allNeighborhoods: Neighborhood[] = [];
  let currentPage = 1;
  let consecutiveEmptyPages = 0;
  const maxEmptyPages = 3;
  const maxPages = 100; // Safety limit
  
  try {
    while (currentPage <= maxPages) {
      console.log(`\n📄 Scraping page ${currentPage}...`);
      
      const neighborhoods = await scrapePage(page, currentPage);
      
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
      
      // Check if there's a next page
      const hasNext = await hasNextPage(page);
      if (!hasNext) {
        console.log(`  ℹ️  No more pages found.`);
        break;
      }
      
      // Go to next page
      const moved = await goToNextPage(page, currentPage);
      if (!moved) {
        console.log(`  ⚠️  Could not navigate to next page, stopping.`);
        break;
      }
      
      currentPage++;
      await sleep(1000); // Rate limiting
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total pages scraped: ${currentPage}`);
    console.log(`  Total neighborhoods found: ${allNeighborhoods.length}`);
    
    // Deduplicate by slug
    const uniqueNeighborhoods = new Map<string, Neighborhood>();
    for (const neighborhood of allNeighborhoods) {
      if (!uniqueNeighborhoods.has(neighborhood.slug)) {
        uniqueNeighborhoods.set(neighborhood.slug, neighborhood);
      }
    }
    
    console.log(`  Unique neighborhoods: ${uniqueNeighborhoods.size}`);
    
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
  } finally {
    await browser.close();
  }
}

// Run the script
main();

