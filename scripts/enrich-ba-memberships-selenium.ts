/**
 * Enrich BA Memberships Script (Selenium)
 * 
 * This script:
 * 1. Uses Selenium to scrape the Brewers Association directory for Maryland breweries
 * 2. Extracts BA membership (BA logo) and Independent Craft Brewer Seal (upside-down bottle icon)
 * 3. Matches breweries by name (with fuzzy matching)
 * 4. Updates the memberships field in Supabase with:
 *    - "brewers_association" for BA members
 *    - "independent_craft_brewers_certified" for Independent Craft Brewer Seal
 * 
 * Usage:
 *   npx tsx scripts/enrich-ba-memberships-selenium.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 * 
 * Required packages:
 *   - selenium-webdriver (npm install selenium-webdriver)
 *   - chromedriver (npm install chromedriver) or use webdriver-manager
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

// Check if admin client is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local');
}

// Get admin client
const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

const client = adminClient as NonNullable<typeof adminClient>;

const BASE_URL = "https://www.brewersassociation.org/directories/breweries/?location=MD";
const MEMBERSHIP_BA = "brewers_association";
const MEMBERSHIP_INDEPENDENT = "independent_craft_brewers_certified";

interface BreweryMembership {
  name: string;
  baMember: boolean;
  independentSeal: boolean;
}

/**
 * Fuzzy match brewery names (handles variations, case-insensitive)
 */
function fuzzyMatchName(name1: string, name2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match
  if (n1 === n2) return true;
  
  // One contains the other (for cases like "ABC Brewing" vs "ABC Brewing Company")
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Check if they share significant words (at least 2 words match)
  const words1 = n1.split(/\s+/).filter(w => w.length > 2);
  const words2 = n2.split(/\s+/).filter(w => w.length > 2);
  const commonWords = words1.filter(w => words2.includes(w));
  
  return commonWords.length >= Math.min(2, Math.min(words1.length, words2.length));
}

/**
 * Click load more button until exhausted
 */
async function clickLoadMoreUntilDone(driver: WebDriver, maxClicks = 50): Promise<number> {
  let clicks = 0;
  
  while (clicks < maxClicks) {
    try {
      // Try various selectors for load more button
      const selectors = [
        "button.load-more",
        "button[aria-label*='Load more']",
        "button:contains('Load More')",
        "a.load-more",
        ".button--load-more",
        "//button[contains(text(), 'Load More')]",
        "//a[contains(text(), 'Load More')]"
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        try {
          let element;
          if (selector.startsWith('//')) {
            // XPath selector
            element = await driver.findElement(By.xpath(selector));
          } else {
            // CSS selector
            element = await driver.findElement(By.css(selector));
          }
          
          const isDisplayed = await element.isDisplayed();
          if (isDisplayed) {
            await driver.executeScript("arguments[0].scrollIntoView(true);", element);
            await driver.sleep(500);
            await element.click();
            await driver.sleep(1500); // Wait for content to load
            clicked = true;
            clicks++;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!clicked) break;
    } catch (error) {
      break;
    }
  }
  
  return clicks;
}

/**
 * Extract brewery membership data from BA website
 */
async function extractBAMemberships(driver: WebDriver): Promise<Map<string, BreweryMembership>> {
  await driver.sleep(2000);
  
  const memberships = new Map<string, BreweryMembership>();
  
  try {
    // Get all brewery entries - adjust selector based on actual page structure
    const breweryElements = await driver.findElements(By.css('div[class*="brewery"], div[class*="listing"], article, .brewery-item, [data-brewery]'));
    
    for (const element of breweryElements) {
      try {
        // Extract brewery name
        let breweryName = '';
        try {
          const nameElement = await element.findElement(By.css('h2, h3, h4, .name, [class*="name"], a'));
          breweryName = await nameElement.getText();
        } catch {
          continue;
        }
        
        if (!breweryName || breweryName.length < 3) continue;
        
        breweryName = breweryName.trim();
        
        // Check for BA Member logo (BA logo)
        let baMember = false;
        try {
          const baLogo = await element.findElement(By.css('img[alt*="BA"], img[src*="ba"], img[alt*="Brewers Association"], [class*="ba-logo"], [class*="ba-member"]'));
          baMember = true;
        } catch {
          // Also check in parent elements
          try {
            const html = await element.getAttribute('innerHTML');
            if (html && (html.includes('ba_member') || html.includes('ba-member') || html.includes('brewers-association'))) {
              baMember = true;
            }
          } catch {}
        }
        
        // Check for Independent Craft Brewer Seal (upside-down bottle icon)
        let independentSeal = false;
        try {
          const sealElement = await element.findElement(By.css('img[alt*="Independent"], img[alt*="Craft"], img[src*="independent"], img[src*="craft"], [class*="independent"], [class*="craft-seal"]'));
          independentSeal = true;
        } catch {
          // Also check in parent elements and look for upside-down bottle icon
          try {
            const html = await element.getAttribute('innerHTML');
            if (html && (html.includes('independent') || html.includes('craft-seal') || html.includes('upside-down') || html.includes('bottle'))) {
              independentSeal = true;
            }
          } catch {}
        }
        
        // Also check for images with specific alt text or class names
        try {
          const images = await element.findElements(By.tagName('img'));
          for (const img of images) {
            const alt = await img.getAttribute('alt');
            const src = await img.getAttribute('src');
            const className = await img.getAttribute('class');
            
            if (alt) {
              const altLower = alt.toLowerCase();
              if (altLower.includes('independent') || altLower.includes('craft') || altLower.includes('seal')) {
                independentSeal = true;
              }
              if (altLower.includes('ba') || altLower.includes('brewers association')) {
                baMember = true;
              }
            }
            
            if (src) {
              const srcLower = src.toLowerCase();
              if (srcLower.includes('independent') || srcLower.includes('craft-seal')) {
                independentSeal = true;
              }
              if (srcLower.includes('ba') || srcLower.includes('brewers-association')) {
                baMember = true;
              }
            }
            
            if (className) {
              const classLower = className.toLowerCase();
              if (classLower.includes('independent') || classLower.includes('craft-seal')) {
                independentSeal = true;
              }
              if (classLower.includes('ba') || classLower.includes('ba-member')) {
                baMember = true;
              }
            }
          }
        } catch {}
        
        if (baMember || independentSeal) {
          memberships.set(breweryName.toLowerCase(), {
            name: breweryName,
            baMember,
            independentSeal
          });
        }
      } catch (error) {
        continue;
      }
    }
  } catch (error) {
    console.error('Error extracting memberships:', error);
  }
  
  return memberships;
}

/**
 * Scrape BA website for membership data using Selenium
 */
async function scrapeBAMemberships(): Promise<Map<string, BreweryMembership>> {
  console.log('🍺 Scraping Brewers Association website for membership data...');
  
  // Set up Chrome options
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    console.log(`   Loading: ${BASE_URL}`);
    await driver.get(BASE_URL);
    await driver.sleep(2000);
    
    // Wait for page to load
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    
    // Click load more if available
    const clicks = await clickLoadMoreUntilDone(driver);
    console.log(`   Clicked 'Load More' ${clicks} times`);
    
    await driver.sleep(2000);
    
    // Extract memberships
    const memberships = await extractBAMemberships(driver);
    console.log(`   ✓ Found ${memberships.size} breweries with membership data`);
    
    await driver.quit();
    return memberships;
  } catch (error) {
    await driver.quit();
    throw error;
  }
}

/**
 * Normalize website URL for comparison
 */
function normalizeWebsite(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    let normalized = url.toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.replace(/^www\./, '');
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Update memberships field with BA data
 */
function updateMemberships(
  currentMemberships: Array<{ name: string; price?: number; duration?: string }>,
  baMember: boolean,
  independentSeal: boolean
): Array<{ name: string; price?: number; duration?: string }> {
  const updated = [...(currentMemberships || [])];
  
  // Remove existing BA memberships to avoid duplicates
  const filtered = updated.filter(m => {
    const n = m.name.toLowerCase();
    return !(
      n.includes('brewers_association') ||
      n.includes('brewers association') ||
      n.includes('independent_craft') ||
      n.includes('independent craft')
    );
  });
  
  // Add BA Member if applicable
  if (baMember) {
    filtered.push({
      name: MEMBERSHIP_BA,
    });
  }
  
  // Add Independent Seal if applicable
  if (independentSeal) {
    filtered.push({
      name: MEMBERSHIP_INDEPENDENT,
    });
  }
  
  return filtered;
}

/**
 * Main enrichment function
 */
async function enrichBAMemberships() {
  console.log('🚀 Starting BA membership enrichment (Selenium)...\n');

  try {
    // Step 1: Scrape BA website
    console.log('📥 Step 1: Scraping Brewers Association website...');
    const baMemberships = await scrapeBAMemberships();
    console.log(`   ✓ Scraped ${baMemberships.size} BA memberships\n`);

    // Step 2: Fetch all breweries from Supabase
    console.log('📥 Step 2: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, name, website, memberships')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 3: Match and update memberships
    console.log('🔍 Step 3: Matching breweries and updating memberships...\n');
    
    let updated = 0;
    let matched = 0;
    let notMatched = 0;
    let skipped = 0;
    let errorCount = 0;
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      
      console.log(`[${i + 1}/${breweries.length}] Processing: ${brewery.name}`);
      
      try {
        // Check BA membership - match by name
        let baMember = false;
        let independentSeal = false;
        let matchedName = '';
        
        // Try exact name match first
        const nameLower = brewery.name.toLowerCase();
        let found = false;
        
        for (const [baName, membership] of baMemberships.entries()) {
          if (baName === nameLower) {
            baMember = membership.baMember;
            independentSeal = membership.independentSeal;
            matchedName = membership.name;
            matched++;
            found = true;
            console.log(`   ✓ Matched by exact name: "${matchedName}"`);
            break;
          }
        }
        
        // Try fuzzy name matching if exact match failed
        if (!found) {
          for (const [baName, membership] of baMemberships.entries()) {
            if (fuzzyMatchName(brewery.name, membership.name)) {
              baMember = membership.baMember;
              independentSeal = membership.independentSeal;
              matchedName = membership.name;
              matched++;
              found = true;
              console.log(`   ✓ Fuzzy matched by name: "${matchedName}"`);
              break;
            }
          }
        }
        
        if (!found) {
          notMatched++;
          console.log(`   ⊘ No BA match found`);
        }
        
        // Update memberships if we have BA data
        if (baMember || independentSeal) {
          const currentMemberships = (brewery.memberships as Array<{ name: string; price?: number; duration?: string }>) || [];
          const updatedMemberships = updateMemberships(currentMemberships, baMember, independentSeal);
          
          // Check if there are actual changes
          if (JSON.stringify(currentMemberships) !== JSON.stringify(updatedMemberships)) {
            const { error } = await client
              .from('breweries')
              .update({ memberships: updatedMemberships })
              .eq('id', brewery.id);
            
            if (error) {
              console.error(`   ✗ Error updating: ${error.message}`);
              errorCount++;
            } else {
              updated++;
              const badges = [];
              if (baMember) badges.push('BA Member');
              if (independentSeal) badges.push('Independent Seal');
              console.log(`   ✅ Updated memberships: ${badges.join(', ')}`);
            }
          } else {
            skipped++;
            console.log(`   ⊘ Memberships already up to date`);
          }
        } else if (matchedName) {
          // Matched but no badges
          skipped++;
          console.log(`   ⊘ Matched but no BA badges`);
        }
        
      } catch (error) {
        console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log(`\n📊 Enrichment Summary:`);
    console.log(`   ✓ Updated: ${updated}`);
    console.log(`   ✓ Matched: ${matched}`);
    console.log(`   ⊘ Not matched: ${notMatched}`);
    console.log(`   ⊘ Skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 BA membership enrichment completed successfully!');

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    process.exit(1);
  }
}

// Run enrichment
enrichBAMemberships().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

