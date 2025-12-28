/**
 * Fetch Brewery Logos Script
 * 
 * This script:
 * 1. Fetches brewery logos from marylandbeer.org/brewing-companies/current-members/
 * 2. Downloads logos to public/logos/ directory
 * 3. Updates Google Sheets with local logo paths
 * 
 * Usage:
 *   npx tsx scripts/fetch-brewery-logos.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { getBreweryDataFromSheets, updateBreweryLogo } from '../lib/google-sheets';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const MARYLAND_BEER_URL = 'https://marylandbeer.org/brewing-companies/current-members/';
const LOGOS_DIR = resolve(process.cwd(), 'public', 'logos');

/**
 * Normalize brewery name for matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch and parse the Maryland Beer members page
 */
async function fetchMarylandBeerPage(): Promise<Map<string, string>> {
  console.log('📥 Fetching Maryland Beer members page...');
  
  const response = await fetch(MARYLAND_BEER_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }
  
  const html = await response.text();
  const logoMap = new Map<string, string>();
  
  // Parse HTML to find brewery logos
  // Look for img tags with brewery logos
  // Pattern: <img src="/wp-content/uploads/.../brewery-name-logo.png" ...>
  const imgRegex = /<img[^>]+src=["']([^"']*\/wp-content\/uploads\/[^"']*\.(png|jpg|jpeg|svg))["'][^>]*>/gi;
  const breweryNameRegex = /alt=["']([^"']+)["']/i;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    const logoUrl = match[1];
    
    // Extract brewery name from alt text or nearby text
    const nameMatch = breweryNameRegex.exec(imgTag);
    if (nameMatch) {
      const breweryName = nameMatch[1];
      const normalizedName = normalizeName(breweryName);
      
      // Convert relative URLs to absolute
      const fullUrl = logoUrl.startsWith('http') 
        ? logoUrl 
        : `https://marylandbeer.org${logoUrl}`;
      
      logoMap.set(normalizedName, fullUrl);
      console.log(`   Found logo: ${breweryName} -> ${fullUrl}`);
    }
  }
  
  // Also try to find logos in data attributes or other patterns
  // Look for brewery cards/items that might contain logos
  const cardRegex = /<div[^>]*class=["'][^"']*brewery[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let cardMatch;
  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const cardHtml = cardMatch[1];
    const cardImgMatch = imgRegex.exec(cardHtml);
    if (cardImgMatch) {
      const logoUrl = cardImgMatch[1];
      const fullUrl = logoUrl.startsWith('http') 
        ? logoUrl 
        : `https://marylandbeer.org${logoUrl}`;
      
      // Try to extract brewery name from card
      const nameMatch = cardHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                       cardHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
      if (nameMatch) {
        const breweryName = nameMatch[1].trim();
        const normalizedName = normalizeName(breweryName);
        if (!logoMap.has(normalizedName)) {
          logoMap.set(normalizedName, fullUrl);
        }
      }
    }
  }
  
  // Also look for direct links to logo images in the page
  // Pattern: href="/wp-content/uploads/.../logo.png"
  const linkRegex = /href=["']([^"']*\/wp-content\/uploads\/[^"']*\.(png|jpg|jpeg|svg))["']/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const logoUrl = match[1];
    const fullUrl = logoUrl.startsWith('http') 
      ? logoUrl 
      : `https://marylandbeer.org${logoUrl}`;
    
    // Try to extract brewery name from surrounding context
    const contextStart = Math.max(0, match.index - 200);
    const contextEnd = Math.min(html.length, match.index + 200);
    const context = html.substring(contextStart, contextEnd);
    
    const nameMatch = context.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                     context.match(/<a[^>]*>([^<]+)<\/a>/i) ||
                     context.match(/title=["']([^"']+)["']/i);
    if (nameMatch) {
      const breweryName = nameMatch[1].trim();
      const normalizedName = normalizeName(breweryName);
      if (!logoMap.has(normalizedName)) {
        logoMap.set(normalizedName, fullUrl);
      }
    }
  }
  
  console.log(`   ✓ Found ${logoMap.size} potential logos\n`);
  return logoMap;
}

/**
 * Download logo image and save to public/logos/
 */
async function downloadLogo(logoUrl: string, breweryName: string): Promise<string> {
  try {
    console.log(`   📥 Downloading: ${logoUrl}`);
    
    const response = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BreweryDirectoryBot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Determine file extension from URL or content type
    let ext = 'png';
    if (logoUrl.match(/\.(jpg|jpeg)$/i) || contentType.includes('jpeg') || contentType.includes('jpg')) {
      ext = 'jpg';
    } else if (logoUrl.match(/\.svg$/i) || contentType.includes('svg')) {
      ext = 'svg';
    } else if (logoUrl.match(/\.png$/i) || contentType.includes('png')) {
      ext = 'png';
    }
    
    // Create safe filename from brewery name
    const safeName = breweryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Limit length
    
    const filename = `${safeName}.${ext}`;
    const filepath = resolve(LOGOS_DIR, filename);
    
    await writeFile(filepath, Buffer.from(buffer));
    
    console.log(`   ✓ Saved: ${filename}`);
    return `/logos/${filename}`;
  } catch (error) {
    console.error(`   ✗ Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Find logo on brewery's website
 */
async function findLogoOnWebsite(websiteUrl: string, breweryName: string): Promise<string | null> {
  try {
    console.log(`   🔍 Searching brewery website: ${websiteUrl}`);
    
    // Ensure URL has protocol
    let url = websiteUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BreweryDirectoryBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const baseUrl = new URL(url).origin;
    
    // Common logo patterns to search for
    const logoPatterns = [
      // Common logo file names
      /<img[^>]+src=["']([^"']*(?:logo|brand|header)[^"']*\.(png|jpg|jpeg|svg))["'][^>]*>/gi,
      // Logo in class names
      /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+\.(png|jpg|jpeg|svg))["'][^>]*>/gi,
      // Logo in data attributes
      /<img[^>]+data-[^=]*=["']([^"']*(?:logo|brand)[^"']*\.(png|jpg|jpeg|svg))["'][^>]*>/gi,
      // Link to logo
      /<a[^>]+href=["']([^"']*(?:logo|brand)[^"']*\.(png|jpg|jpeg|svg))["'][^>]*>/gi,
      // Meta og:image (social media image, often the logo)
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
      // Link rel="icon" or "apple-touch-icon" (sometimes used as logo)
      /<link[^>]+rel=["'](?:icon|apple-touch-icon)["'][^>]+href=["']([^"']+\.(png|jpg|jpeg|svg))["'][^>]*>/gi,
    ];
    
    const foundLogos: string[] = [];
    
    for (const pattern of logoPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let logoUrl = match[1];
        
        // Skip very small images (likely icons, not logos)
        if (logoUrl.includes('favicon') || logoUrl.includes('icon-')) {
          continue;
        }
        
        // Convert relative URLs to absolute
        if (logoUrl.startsWith('//')) {
          logoUrl = `https:${logoUrl}`;
        } else if (logoUrl.startsWith('/')) {
          logoUrl = `${baseUrl}${logoUrl}`;
        } else if (!logoUrl.startsWith('http')) {
          logoUrl = `${baseUrl}/${logoUrl}`;
        }
        
        if (!foundLogos.includes(logoUrl)) {
          foundLogos.push(logoUrl);
        }
      }
    }
    
    // Also try common logo paths
    const commonPaths = [
      '/logo.png',
      '/logo.jpg',
      '/logo.svg',
      '/images/logo.png',
      '/images/logo.jpg',
      '/img/logo.png',
      '/img/logo.jpg',
      '/assets/logo.png',
      '/assets/images/logo.png',
      '/wp-content/uploads/logo.png',
    ];
    
    for (const path of commonPaths) {
      const testUrl = `${baseUrl}${path}`;
      try {
        const testResponse = await fetch(testUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BreweryDirectoryBot/1.0)',
          },
          signal: AbortSignal.timeout(5000),
        });
        if (testResponse.ok && testResponse.headers.get('content-type')?.startsWith('image/')) {
          if (!foundLogos.includes(testUrl)) {
            foundLogos.push(testUrl);
          }
        }
      } catch {
        // Ignore errors for test URLs
      }
    }
    
    if (foundLogos.length > 0) {
      // Prefer larger images (likely actual logos, not icons)
      // Sort by URL length (shorter URLs are often main logos)
      foundLogos.sort((a, b) => {
        // Prefer PNG/SVG over JPG
        if (a.match(/\.(png|svg)$/i) && !b.match(/\.(png|svg)$/i)) return -1;
        if (!a.match(/\.(png|svg)$/i) && b.match(/\.(png|svg)$/i)) return 1;
        return a.length - b.length;
      });
      
      const selectedLogo = foundLogos[0];
      console.log(`   ✓ Found logo on website: ${selectedLogo}`);
      return selectedLogo;
    }
    
    return null;
  } catch (error) {
    console.warn(`   ⚠️  Could not search website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Generate markdown report for missing logos and errors
 */
function generateMissingLogosReport(
  notFound: Array<{ name: string; id: string; website?: string; reason: string }>,
  errors: Array<{ name: string; id: string; website?: string; error: string }>
): string {
  const timestamp = new Date().toISOString();
  
  let content = `# Missing Brewery Logos Report\n\n`;
  content += `Generated: ${timestamp}\n\n`;
  content += `This report lists breweries that need manual logo review.\n\n`;
  
  if (notFound.length > 0) {
    content += `## Logos Not Found (${notFound.length})\n\n`;
    content += `These breweries did not have logos found on the Maryland Beer website or their own website.\n\n`;
    content += `| Brewery Name | ID | Website | Reason |\n`;
    content += `|--------------|-----|---------|--------|\n`;
    
    for (const brewery of notFound) {
      const website = brewery.website || 'N/A';
      const reason = brewery.reason.replace(/\|/g, '\\|'); // Escape pipes in markdown
      content += `| ${brewery.name} | ${brewery.id} | ${website} | ${reason} |\n`;
    }
    
    content += `\n`;
  }
  
  if (errors.length > 0) {
    content += `## Errors (${errors.length})\n\n`;
    content += `These breweries encountered errors during logo download.\n\n`;
    content += `| Brewery Name | ID | Website | Error |\n`;
    content += `|--------------|-----|---------|-------|\n`;
    
    for (const brewery of errors) {
      const website = brewery.website || 'N/A';
      const errorMsg = brewery.error.replace(/\|/g, '\\|'); // Escape pipes in markdown
      content += `| ${brewery.name} | ${brewery.id} | ${website} | ${errorMsg} |\n`;
    }
    
    content += `\n`;
  }
  
  content += `## Next Steps\n\n`;
  content += `1. Review the breweries listed above\n`;
  content += `2. Manually find logos for these breweries\n`;
  content += `3. Download logos and save to \`public/logos/\` directory\n`;
  content += `4. Update Google Sheets with the logo path (e.g., \`/logos/brewery-name.png\`)\n`;
  content += `5. Or add the logo URL directly to the \`logo\` column in Google Sheets\n\n`;
  content += `## Tips\n\n`;
  content += `- Check brewery websites manually\n`;
  content += `- Look for logos on social media pages\n`;
  content += `- Use Google Image Search: "brewery name" logo\n`;
  content += `- Check brewery's Untappd or Facebook page\n`;
  
  return content;
}

/**
 * Main function
 */
async function fetchBreweryLogos() {
  console.log('🚀 Starting brewery logo fetch...\n');
  
  try {
    // Create logos directory if it doesn't exist
    if (!existsSync(LOGOS_DIR)) {
      await mkdir(LOGOS_DIR, { recursive: true });
      console.log(`✓ Created directory: ${LOGOS_DIR}\n`);
    }
    
    // Step 1: Fetch breweries from Google Sheets
    console.log('📥 Step 1: Fetching breweries from Google Sheets...');
    const breweries = await getBreweryDataFromSheets();
    console.log(`   ✓ Found ${breweries.length} breweries\n`);
    
    // Filter breweries that need logos:
    // 1. No logo at all
    // 2. Logo is an external URL (http:// or https://)
    const breweriesNeedingLogos = breweries.filter(b => {
      if (!b.logo || b.logo.trim() === '') {
        return true; // No logo
      }
      const logo = b.logo.trim();
      // Check if it's an external URL
      if (logo.startsWith('http://') || logo.startsWith('https://')) {
        return true; // External URL, needs to be downloaded
      }
      return false; // Already has local path
    });
    
    // Separate into two groups
    const breweriesWithoutLogos = breweries.filter(b => !b.logo || b.logo.trim() === '');
    const breweriesWithExternalLogos = breweries.filter(b => {
      const logo = b.logo?.trim() || '';
      return logo.startsWith('http://') || logo.startsWith('https://');
    });
    
    console.log(`   ℹ️  ${breweriesWithoutLogos.length} breweries need logos`);
    console.log(`   ℹ️  ${breweriesWithExternalLogos.length} breweries have external logo URLs (will be downloaded)\n`);
    
    if (breweriesNeedingLogos.length === 0) {
      console.log('✅ All breweries already have local logos!');
      return;
    }
    
    // Step 2: Download external logos first (these already have URLs)
    if (breweriesWithExternalLogos.length > 0) {
      console.log('📥 Step 2: Downloading external logo URLs...\n');
    }
    
    let downloaded = 0;
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    // Track breweries that need manual attention
    const notFoundBreweries: Array<{ name: string; id: string; website?: string; reason: string }> = [];
    const errorBreweries: Array<{ name: string; id: string; website?: string; error: string }> = [];
    
    // First, handle breweries with external logo URLs
    let processedCount = 0;
    for (const brewery of breweriesWithExternalLogos) {
      const logoUrl = brewery.logo!.trim();
      processedCount++;
      console.log(`[${processedCount}/${breweriesNeedingLogos.length}] ${brewery.name}`);
      console.log(`   🔗 Found external logo URL: ${logoUrl}`);
      
      try {
        // Download logo
        const logoPath = await downloadLogo(logoUrl, brewery.name);
        downloaded++;
        
        // Update Google Sheets
        await updateBreweryLogo(brewery.id, logoPath);
        updated++;
        console.log(`   ✓ Downloaded and updated Google Sheets with: ${logoPath}\n`);
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ✗ Error downloading external logo: ${errorMessage}\n`);
        errors++;
        errorBreweries.push({
          name: brewery.name,
          id: brewery.id,
          website: brewery.website,
          error: `Failed to download external logo: ${errorMessage}`
        });
      }
    }
    
    // Step 3: Match breweries to logos and download (for breweries without logos)
    let logoMap = new Map<string, string>();
    if (breweriesWithoutLogos.length > 0) {
      console.log('\n📥 Step 3: Finding and downloading logos for breweries without logos...\n');
      
      // Fetch Maryland Beer page and extract logos
      logoMap = await fetchMarylandBeerPage();
      
      if (logoMap.size === 0) {
        console.log('⚠️  No logos found on Maryland Beer website. The page structure may have changed.');
        console.log('   Will try brewery websites as fallback...\n');
      }
    }
    
    for (const brewery of breweriesWithoutLogos) {
      const normalizedName = normalizeName(brewery.name);
      processedCount++;
      console.log(`[${processedCount}/${breweriesNeedingLogos.length}] ${brewery.name}`);
      
      // Try exact match first
      let logoUrl = logoMap.get(normalizedName);
      
      // Try partial matches if exact match fails
      if (!logoUrl) {
        for (const [mapName, url] of logoMap.entries()) {
          if (normalizedName.includes(mapName) || mapName.includes(normalizedName)) {
            logoUrl = url;
            console.log(`   ℹ️  Found partial match: ${mapName}`);
            break;
          }
        }
      }
      
      // Try matching without common suffixes
      if (!logoUrl) {
        const nameWithoutSuffix = normalizedName
          .replace(/\s+(brewing|brewery|brewing company|brewing co|brewing co\.|breweries|beer company|beer co|beer co\.)$/i, '');
        
        for (const [mapName, url] of logoMap.entries()) {
          const mapNameWithoutSuffix = mapName
            .replace(/\s+(brewing|brewery|brewing company|brewing co|brewing co\.|breweries|beer company|beer co|beer co\.)$/i, '');
          
          if (nameWithoutSuffix === mapNameWithoutSuffix || 
              nameWithoutSuffix.includes(mapNameWithoutSuffix) || 
              mapNameWithoutSuffix.includes(nameWithoutSuffix)) {
            logoUrl = url;
            console.log(`   ℹ️  Found match after removing suffix: ${mapName}`);
            break;
          }
        }
      }
      
      // If not found on Maryland Beer website, try brewery's own website
      if (!logoUrl && brewery.website) {
        console.log(`   🔍 Logo not found on Maryland Beer website, trying brewery website...`);
        try {
          const websiteLogoUrl = await findLogoOnWebsite(brewery.website, brewery.name);
          if (websiteLogoUrl) {
            logoUrl = websiteLogoUrl;
          }
        } catch (error) {
          console.warn(`   ⚠️  Error searching brewery website: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      if (!logoUrl) {
        console.log(`   ⚠️  Logo not found on Maryland Beer website or brewery website`);
        notFound++;
        notFoundBreweries.push({
          name: brewery.name,
          id: brewery.id,
          website: brewery.website,
          reason: brewery.website 
            ? 'Not found on Maryland Beer website or brewery website' 
            : 'Not found on Maryland Beer website (no website URL in Google Sheets)'
        });
        console.log('');
        continue;
      }
      
      try {
        // Download logo
        const logoPath = await downloadLogo(logoUrl, brewery.name);
        downloaded++;
        
        // Update Google Sheets
        await updateBreweryLogo(brewery.id, logoPath);
        updated++;
        console.log(`   ✓ Updated Google Sheets with: ${logoPath}\n`);
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ✗ Error: ${errorMessage}\n`);
        errors++;
        errorBreweries.push({
          name: brewery.name,
          id: brewery.id,
          website: brewery.website,
          error: errorMessage
        });
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✓ Logos downloaded: ${downloaded}`);
    console.log(`   ✓ Google Sheets updated: ${updated}`);
    console.log(`   ⚠️  Logos not found: ${notFound}`);
    console.log(`   ✗ Errors: ${errors}\n`);
    
    // Write missing logos and errors to markdown file
    if (notFoundBreweries.length > 0 || errorBreweries.length > 0) {
      const reportPath = resolve(process.cwd(), 'BREWERY_LOGOS_MISSING.md');
      const reportContent = generateMissingLogosReport(notFoundBreweries, errorBreweries);
      await writeFile(reportPath, reportContent);
      console.log(`📝 Report written to: BREWERY_LOGOS_MISSING.md\n`);
    }
    
    console.log('🎉 Logo fetch completed!');
    
  } catch (error) {
    console.error('\n❌ Logo fetch failed:', error);
    process.exit(1);
  }
}

// Run the script
fetchBreweryLogos().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

