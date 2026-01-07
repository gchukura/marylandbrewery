/**
 * IndexNow URL Submission Script
 * 
 * Submits all URLs from your sitemap to IndexNow API for instant indexing
 * by Bing, Yandex, and other participating search engines.
 * 
 * Usage: npx tsx scripts/submit-indexnow.ts
 * 
 * Note: Google does not participate in IndexNow, but Bing and Yandex do.
 */

import { parseStringPromise } from 'xml2js';

const INDEXNOW_KEY = '457bccd4eef437d8877d15d3e947fa02';
const HOST = 'www.marylandbrewery.com';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// IndexNow endpoints (can use any of these)
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

interface SitemapUrl {
  loc: string[];
  lastmod?: string[];
  priority?: string[];
}

interface SitemapData {
  urlset: {
    url: SitemapUrl[];
  };
}

/**
 * Fetch and parse the sitemap
 */
async function fetchSitemap(): Promise<string[]> {
  console.log(`${colors.blue}📥 Fetching sitemap from ${SITEMAP_URL}...${colors.reset}`);
  
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }
  
  const xml = await response.text();
  const parsed: SitemapData = await parseStringPromise(xml);
  
  const urls = parsed.urlset.url.map((item) => item.loc[0]);
  console.log(`${colors.green}✅ Found ${urls.length} URLs in sitemap${colors.reset}\n`);
  
  return urls;
}

/**
 * Submit URLs to IndexNow in batches
 */
async function submitToIndexNow(urls: string[]): Promise<void> {
  const endpoint = INDEXNOW_ENDPOINTS[0]; // Use main API endpoint
  const batchSize = 10000; // IndexNow allows up to 10,000 URLs per request
  
  console.log(`${colors.blue}🚀 Submitting ${urls.length} URLs to IndexNow...${colors.reset}\n`);
  
  // Split into batches if needed
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(urls.length / batchSize);
    
    console.log(`${colors.cyan}📦 Batch ${batchNum}/${totalBatches}: ${batch.length} URLs${colors.reset}`);
    
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok || response.status === 200 || response.status === 202) {
        console.log(`   ${colors.green}✅ Batch ${batchNum} submitted successfully (${response.status})${colors.reset}`);
      } else {
        const errorText = await response.text();
        console.log(`   ${colors.red}❌ Batch ${batchNum} failed: ${response.status} - ${errorText}${colors.reset}`);
        
        // Log specific error reasons
        if (response.status === 400) {
          console.log(`   ${colors.yellow}   Reason: Invalid format${colors.reset}`);
        } else if (response.status === 403) {
          console.log(`   ${colors.yellow}   Reason: Key not valid (check key file exists at ${KEY_LOCATION})${colors.reset}`);
        } else if (response.status === 422) {
          console.log(`   ${colors.yellow}   Reason: URLs don't belong to host or key mismatch${colors.reset}`);
        } else if (response.status === 429) {
          console.log(`   ${colors.yellow}   Reason: Too many requests (rate limited)${colors.reset}`);
        }
      }
    } catch (error) {
      console.log(`   ${colors.red}❌ Batch ${batchNum} error: ${error}${colors.reset}`);
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   IndexNow URL Submission Tool${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.cyan}Host:${colors.reset} ${HOST}`);
  console.log(`${colors.cyan}Key:${colors.reset} ${INDEXNOW_KEY}`);
  console.log(`${colors.cyan}Key Location:${colors.reset} ${KEY_LOCATION}\n`);
  
  try {
    // First verify the key file is accessible
    console.log(`${colors.blue}🔑 Verifying key file...${colors.reset}`);
    const keyResponse = await fetch(KEY_LOCATION);
    if (!keyResponse.ok) {
      console.log(`${colors.red}❌ Key file not accessible at ${KEY_LOCATION}${colors.reset}`);
      console.log(`${colors.yellow}   Make sure the file exists and is deployed.${colors.reset}\n`);
      process.exit(1);
    }
    console.log(`${colors.green}✅ Key file verified${colors.reset}\n`);
    
    // Fetch sitemap URLs
    const urls = await fetchSitemap();
    
    // Submit to IndexNow
    await submitToIndexNow(urls);
    
    console.log(`\n${colors.green}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}   ✅ IndexNow submission complete!${colors.reset}`);
    console.log(`${colors.green}═══════════════════════════════════════════${colors.reset}\n`);
    
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. URLs will be crawled by Bing/Yandex within minutes to hours`);
    console.log(`2. Check Bing Webmaster Tools for indexing status`);
    console.log(`3. Run this script again after adding new content\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error}${colors.reset}\n`);
    process.exit(1);
  }
}

main();

