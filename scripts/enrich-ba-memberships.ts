/**
 * Enrich BA Memberships Script
 * 
 * This script:
 * 1. Scrapes the Brewers Association website for Maryland breweries
 * 2. Extracts BA membership and Independent Craft Brewer Seal data
 * 3. Matches breweries by name (with fuzzy matching)
 * 4. Updates the memberships field in Supabase
 * 
 * Usage:
 *   npx tsx scripts/enrich-ba-memberships.ts
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
import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';
import { chromium, Page } from 'playwright';

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
const MEMBER_TOKEN = "ba_member";
const INDEP_TOKEN = "ba_independent_seal";

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
async function clickLoadMoreUntilDone(page: Page, maxClicks = 50): Promise<number> {
  const loadSelectorCandidates = [
    "button.load-more",
    "button[aria-label*='Load more']",
    "button:has-text('Load More')",
    "a.load-more",
    ".button--load-more",
    "button"
  ];

  let clicks = 0;
  while (clicks < maxClicks) {
    let clicked = false;
    for (const sel of loadSelectorCandidates) {
      try {
        const button = await page.$(sel);
        if (!button) continue;
        
        const isVisible = await button.isVisible();
        if (isVisible) {
          await button.scrollIntoViewIfNeeded();
          try {
            await button.click({ timeout: 5000 });
          } catch {
            await page.evaluate((el: HTMLElement) => el.click(), await button.elementHandle());
          }
          await page.waitForTimeout(1200);
          clicked = true;
          clicks++;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!clicked) break;
  }
  return clicks;
}

/**
 * Normalize website URL for comparison
 */
function normalizeWebsite(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Remove protocol, www, trailing slashes, and convert to lowercase
    let normalized = url.toLowerCase().trim();
    
    // Remove protocol
    normalized = normalized.replace(/^https?:\/\//, '');
    
    // Remove www.
    normalized = normalized.replace(/^www\./, '');
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    // Remove path if it's just the domain (optional - you might want to keep paths)
    // normalized = normalized.split('/')[0];
    
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Extract brewery membership data from BA website
 * Returns a map keyed by normalized website URL
 */
async function extractBAMemberships(page: Page): Promise<Map<string, { name: string; ba_member: boolean; independent_seal: boolean }>> {
  await page.waitForTimeout(1200);
  
  const memberships = new Map<string, { name: string; ba_member: boolean; independent_seal: boolean }>();
  
  // Get all anchor links
  const anchors = await page.$$('a[href]');
  
  for (const anchor of anchors) {
    try {
      const name = (await anchor.textContent() || '').trim();
      let href = await anchor.getAttribute('href') || '';
      
      if (!name || name.length < 3) continue;
      
      // Filter out navigation links
      if (/facebook|twitter|instagram|#|mailto:|tel:|javascript:|linkedin|privacy|terms/i.test(href)) {
        continue;
      }
      
      // Normalize href
      if (href.startsWith('/')) {
        href = `https://www.brewersassociation.org${href}`;
      }
      
      // Skip if it's not an external website (likely a BA internal link)
      if (href.includes('brewersassociation.org')) {
        continue;
      }
      
      // Extract website from the container text (BA often shows website in the listing)
      const containerText = await anchor.evaluate((node) => {
        let el: HTMLElement | null = node as HTMLElement;
        for (let i = 0; i < 6; i++) {
          el = el?.parentElement || null;
          if (!el) break;
          const text = el.innerText || '';
          if (text.length > 0) return text;
        }
        return '';
      });
      
      // Try to find website URL in container text or use href if it's an external link
      let website: string | null = null;
      
      // Check if href is an external website
      if (href && !href.includes('brewersassociation.org') && (href.startsWith('http://') || href.startsWith('https://'))) {
        website = normalizeWebsite(href);
      } else {
        // Try to extract website from text (look for www. or http patterns)
        const websiteMatch = containerText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (websiteMatch && websiteMatch[1]) {
          website = normalizeWebsite(websiteMatch[1]);
        }
      }
      
      // Skip if we don't have a website
      if (!website) continue;
      
      if (!memberships.has(website)) {
        memberships.set(website, { name, ba_member: false, independent_seal: false });
      }
      
      // Get ancestor HTML to check for badges
      const ancHtml = await anchor.evaluate((node) => {
        let el: HTMLElement | null = node as HTMLElement;
        for (let i = 0; i < 6; i++) {
          el = el?.parentElement || null;
          if (!el) break;
          const html = el.innerHTML || '';
          if (html.length > 0) return html.toLowerCase();
        }
        return '';
      });
      
      const membership = memberships.get(website)!;
      if (ancHtml.includes(MEMBER_TOKEN)) {
        membership.ba_member = true;
      }
      if (ancHtml.includes(INDEP_TOKEN)) {
        membership.independent_seal = true;
      }
      
    } catch {
      continue;
    }
  }
  
  // Also check images for badges
  const imgs = await page.$$('img');
  for (const img of imgs) {
    try {
      const src = (await img.getAttribute('src') || '').toLowerCase();
      const alt = (await img.getAttribute('alt') || '').toLowerCase();
      const containsMember = src.includes(MEMBER_TOKEN) || alt.includes(MEMBER_TOKEN);
      const containsIndep = src.includes(INDEP_TOKEN) || alt.includes(INDEP_TOKEN);
      
      if (!containsMember && !containsIndep) continue;
      
      // Find nearest anchor
      let elHandle = await img.elementHandle();
      
      for (let i = 0; i < 6; i++) {
        if (!elHandle) break;
        const parent = await elHandle.evaluateHandle((el) => el.parentElement);
        if (!parent) break;
        
        const anchor = await (parent as any).$('a[href]');
        if (anchor) {
          const name = (await anchor.textContent() || '').trim();
          if (name && name.length >= 3) {
            // Try to get website from anchor or container
            let href = await anchor.getAttribute('href') || '';
            if (href.startsWith('/')) {
              href = `https://www.brewersassociation.org${href}`;
            }
            
            let website: string | null = null;
            if (href && !href.includes('brewersassociation.org') && (href.startsWith('http://') || href.startsWith('https://'))) {
              website = normalizeWebsite(href);
            } else {
              const containerText = await anchor.evaluate((node) => {
                let el: HTMLElement | null = node as HTMLElement;
                for (let i = 0; i < 6; i++) {
                  el = el?.parentElement || null;
                  if (!el) break;
                  const text = el.innerText || '';
                  if (text.length > 0) return text;
                }
                return '';
              });
              const websiteMatch = containerText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
              if (websiteMatch && websiteMatch[1]) {
                website = normalizeWebsite(websiteMatch[1]);
              }
            }
            
            if (website) {
              if (!memberships.has(website)) {
                memberships.set(website, { name, ba_member: false, independent_seal: false });
              }
              const membership = memberships.get(website)!;
              if (containsMember) membership.ba_member = true;
              if (containsIndep) membership.independent_seal = true;
              break;
            }
          }
        }
        elHandle = parent as any;
      }
    } catch {
      continue;
    }
  }
  
  return memberships;
}

/**
 * Scrape BA website for membership data
 */
async function scrapeBAMemberships(): Promise<Map<string, { name: string; ba_member: boolean; independent_seal: boolean }>> {
  console.log('🍺 Scraping Brewers Association website for membership data...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log(`   Loading: ${BASE_URL}`);
    await page.goto(BASE_URL, { timeout: 60000, waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Click load more
    const clicks = await clickLoadMoreUntilDone(page);
    console.log(`   Clicked 'Load More' ${clicks} times`);
    
    await page.waitForTimeout(1200);
    
    // Extract memberships
    const memberships = await extractBAMemberships(page);
    console.log(`   ✓ Found ${memberships.size} breweries with membership data`);
    
    await browser.close();
    return memberships;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Update memberships field with BA data
 */
function updateMemberships(
  currentMemberships: Array<{ name: string; description?: string; benefits?: string[]; price?: number; duration?: string }>,
  baMember: boolean,
  independentSeal: boolean
): Array<{ name: string; description?: string; benefits?: string[]; price?: number; duration?: string }> {
  const updated = [...(currentMemberships || [])];
  
  // Remove existing BA memberships to avoid duplicates
  const filtered = updated.filter(m => 
    !m.name.toLowerCase().includes('brewers association') && 
    !m.name.toLowerCase().includes('independent craft')
  );
  
  // Add BA Member if applicable
  if (baMember) {
    filtered.push({
      name: 'Brewers Association Member',
      description: 'Member of the Brewers Association',
      benefits: ['Access to BA resources and networking'],
    });
  }
  
  // Add Independent Seal if applicable
  if (independentSeal) {
    filtered.push({
      name: 'Independent Craft Brewer Seal',
      description: 'Certified Independent Craft Brewer by the Brewers Association',
      benefits: ['Independent craft brewery certification'],
    });
  }
  
  return filtered;
}

/**
 * Main enrichment function
 */
async function enrichBAMemberships() {
  console.log('🚀 Starting BA membership enrichment...\n');

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
        // Check BA membership - match by website first
        let baMember = false;
        let independentSeal = false;
        let matchedWebsite = '';
        let matchedName = '';
        
        // Normalize brewery website
        const breweryWebsite = normalizeWebsite(brewery.website);
        
        // Try website match first (most reliable)
        if (breweryWebsite && baMemberships.has(breweryWebsite)) {
          const membership = baMemberships.get(breweryWebsite)!;
          baMember = membership.ba_member;
          independentSeal = membership.independent_seal;
          matchedWebsite = breweryWebsite;
          matchedName = membership.name;
          matched++;
          console.log(`   ✓ Matched by website: "${breweryWebsite}" (BA name: "${matchedName}")`);
        } else {
          // Fallback to name matching if website not available or doesn't match
          if (!breweryWebsite) {
            console.log(`   ⚠️  No website in database, trying name match...`);
          }
          
          // Try exact name match
          const nameLower = brewery.name.toLowerCase();
          let found = false;
          for (const [website, membership] of baMemberships.entries()) {
            if (membership.name.toLowerCase() === nameLower) {
              baMember = membership.ba_member;
              independentSeal = membership.independent_seal;
              matchedWebsite = website;
              matchedName = membership.name;
              matched++;
              found = true;
              console.log(`   ✓ Matched by name: "${matchedName}" (website: "${website}")`);
              break;
            }
          }
          
          // Try fuzzy name matching if exact match failed
          if (!found) {
            for (const [website, membership] of baMemberships.entries()) {
              if (fuzzyMatchName(brewery.name, membership.name)) {
                baMember = membership.ba_member;
                independentSeal = membership.independent_seal;
                matchedWebsite = website;
                matchedName = membership.name;
                matched++;
                found = true;
                console.log(`   ✓ Fuzzy matched by name: "${matchedName}" (website: "${website}")`);
                break;
              }
            }
          }
          
          if (!found) {
            notMatched++;
            console.log(`   ⊘ No BA match found${breweryWebsite ? ` (website: ${breweryWebsite})` : ' (no website)'}`);
          }
        }
        
        // Update memberships if we have BA data
        if (baMember || independentSeal) {
          const currentMemberships = (brewery.memberships as any[]) || [];
          const updatedMemberships = updateMemberships(currentMemberships, baMember, independentSeal);
          
          // Check if there are actual changes
          const currentBA = currentMemberships.some(m => 
            m.name.toLowerCase().includes('brewers association') || 
            m.name.toLowerCase().includes('independent craft')
          );
          
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
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - BA entries found: ${baMemberships.size}`);
    console.log(`  - Breweries matched: ${matched}`);
    console.log(`  - Memberships updated: ${updated}`);
    console.log(`  - Not matched: ${notMatched}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Errors: ${errorCount}`);

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

