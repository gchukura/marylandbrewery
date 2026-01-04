#!/usr/bin/env tsx

/**
 * Diagnostic script to check if cache is causing the issue with -md pages
 * This script helps identify whether the problem is:
 * - Stale build cache
 * - Browser cache
 * - Next.js ISR cache
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { getBreweryDataFromSupabase } from '../lib/supabase-client';
import { processBreweryData } from '../lib/brewery-data';
import { slugify, deslugify } from '../src/lib/data-utils';

async function checkBuildCache() {
  console.log('🔍 Checking Build Cache...\n');
  
  const nextDir = join(process.cwd(), '.next');
  const exists = existsSync(nextDir);
  
  console.log(`  .next directory exists: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    try {
      const stats = statSync(nextDir);
      const lastModified = stats.mtime;
      const ageInHours = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
      
      console.log(`  Last modified: ${lastModified.toLocaleString()}`);
      console.log(`  Age: ${ageInHours.toFixed(2)} hours`);
      
      if (ageInHours > 1) {
        console.log(`  ⚠️  Build cache is ${ageInHours.toFixed(1)} hours old - may be stale`);
      } else {
        console.log(`  ✅ Build cache is recent`);
      }
    } catch (error) {
      console.log(`  ⚠️  Could not read .next directory stats`);
    }
  }
  
  // Check for static pages
  const staticPagesDir = join(nextDir, 'server', 'app');
  const staticPagesExist = existsSync(staticPagesDir);
  console.log(`  Static pages directory exists: ${staticPagesExist ? '✅' : '❌'}`);
  
  if (staticPagesExist) {
    // Check for county page
    const countyPagePath = join(staticPagesDir, 'counties', '[county]-md', 'breweries');
    const countyPageExists = existsSync(countyPagePath);
    console.log(`  County -md page built: ${countyPageExists ? '✅' : '❌'}`);
    
    // Check for city page
    const cityPagePath = join(staticPagesDir, 'cities', '[city]-md', 'breweries');
    const cityPageExists = existsSync(cityPagePath);
    console.log(`  City -md page built: ${cityPageExists ? '✅' : '❌'}`);
  }
  
  console.log('');
}

async function checkDataConsistency() {
  console.log('🔍 Checking Data Consistency...\n');
  
  // Fetch fresh data
  console.log('  Fetching fresh data from Supabase...');
  const breweries = await getBreweryDataFromSupabase();
  const processed = await processBreweryData(breweries);
  
  // Test Anne Arundel specifically
  const testCounty = 'Anne Arundel';
  const countySlug = slugify(testCounty);
  const mdSlug = `${countySlug}-md`;
  
  console.log(`  Testing: ${testCounty}`);
  console.log(`  Original slug: ${countySlug}`);
  console.log(`  MD slug: ${mdSlug}`);
  
  // Simulate the extraction logic
  const countySlugFromParam = mdSlug.replace(/-md$/, '');
  const extractedName = deslugify(countySlugFromParam);
  
  console.log(`  After strip -md: ${countySlugFromParam}`);
  console.log(`  Extracted name: ${extractedName}`);
  console.log(`  Name matches: ${extractedName === testCounty ? '✅' : '❌'}`);
  
  if (extractedName !== testCounty) {
    console.log(`  ⚠️  NAME MISMATCH - This is the problem!`);
  }
  
  // Check brewery count
  const countyKey = extractedName.toLowerCase();
  const filteredBreweries = processed.breweries.filter((b: any) => {
    const breweryCounty = b.county;
    return breweryCounty && breweryCounty.toLowerCase() === countyKey;
  });
  
  console.log(`  Breweries found: ${filteredBreweries.length}`);
  
  if (filteredBreweries.length === 0) {
    console.log(`  ⚠️  NO BREWERIES FOUND - Checking county names in database...`);
    
    // Check what county names actually exist
    const allCounties = new Set<string>();
    processed.breweries.forEach((b: any) => {
      if (b.county) {
        allCounties.add(b.county);
      }
    });
    
    console.log(`  Counties in database: ${Array.from(allCounties).sort().join(', ')}`);
    
    // Check for case variations
    const matchingCounties = Array.from(allCounties).filter(c => 
      c.toLowerCase() === countyKey
    );
    
    if (matchingCounties.length > 0) {
      console.log(`  ✅ Found matching county: ${matchingCounties[0]}`);
    } else {
      console.log(`  ❌ No matching county found in database`);
    }
  } else {
    console.log(`  ✅ Found ${filteredBreweries.length} breweries`);
    console.log(`  Sample breweries: ${filteredBreweries.slice(0, 3).map((b: any) => b.name).join(', ')}`);
  }
  
  console.log('');
}

async function checkPageConfiguration() {
  console.log('🔍 Checking Page Configuration...\n');
  
  const countyPagePath = join(process.cwd(), 'src', 'app', 'counties', '[county]-md', 'breweries', 'page.tsx');
  const cityPagePath = join(process.cwd(), 'src', 'app', 'cities', '[city]-md', 'breweries', 'page.tsx');
  
  console.log(`  County page exists: ${existsSync(countyPagePath) ? '✅' : '❌'}`);
  console.log(`  City page exists: ${existsSync(cityPagePath) ? '✅' : '❌'}`);
  
  if (existsSync(countyPagePath)) {
    const content = readFileSync(countyPagePath, 'utf-8');
    
    // Check for revalidate export
    const hasRevalidate = content.includes('export const revalidate');
    const hasDynamic = content.includes('export const dynamic');
    const hasGenerateStaticParams = content.includes('generateStaticParams');
    
    console.log(`  Has revalidate: ${hasRevalidate ? '✅' : '❌'}`);
    console.log(`  Has dynamic: ${hasDynamic ? '✅' : '❌'}`);
    console.log(`  Has generateStaticParams: ${hasGenerateStaticParams ? '✅' : '❌'}`);
    
    if (hasRevalidate) {
      const revalidateMatch = content.match(/export const revalidate\s*=\s*(\d+)/);
      if (revalidateMatch) {
        console.log(`  Revalidate time: ${revalidateMatch[1]} seconds`);
      }
    }
    
    if (hasDynamic) {
      const dynamicMatch = content.match(/export const dynamic\s*=\s*['"]([^'"]+)['"]/);
      if (dynamicMatch) {
        console.log(`  Dynamic mode: ${dynamicMatch[1]}`);
      }
    }
  }
  
  console.log('');
}

async function checkBrowserCacheInstructions() {
  console.log('🔍 Browser Cache Check Instructions...\n');
  console.log('  To check if it\'s browser cache:');
  console.log('  1. Open the page in an incognito/private window');
  console.log('  2. Or use a different browser');
  console.log('  3. Or hard refresh:');
  console.log('     - Mac: Cmd + Shift + R');
  console.log('     - Windows/Linux: Ctrl + Shift + R');
  console.log('  4. Or clear browser cache for the site');
  console.log('');
  console.log('  To check the actual response:');
  console.log('  1. Open browser DevTools (F12)');
  console.log('  2. Go to Network tab');
  console.log('  3. Reload the page');
  console.log('  4. Check the response headers for:');
  console.log('     - Cache-Control');
  console.log('     - X-Cache (if using CDN)');
  console.log('     - Age (if using ISR)');
  console.log('');
}

async function checkNextConfig() {
  console.log('🔍 Checking Next.js Configuration...\n');
  
  const nextConfigPath = join(process.cwd(), 'next.config.ts');
  const nextConfigJsPath = join(process.cwd(), 'next.config.js');
  
  const configPath = existsSync(nextConfigPath) ? nextConfigPath : 
                     existsSync(nextConfigJsPath) ? nextConfigJsPath : null;
  
  if (configPath) {
    console.log(`  Config file: ${configPath}`);
    const content = readFileSync(configPath, 'utf-8');
    
    // Check for output mode
    if (content.includes('output')) {
      const outputMatch = content.match(/output:\s*['"]([^'"]+)['"]/);
      if (outputMatch) {
        console.log(`  Output mode: ${outputMatch[1]}`);
        if (outputMatch[1] === 'export') {
          console.log(`  ⚠️  Static export mode - pages are pre-rendered`);
        }
      }
    }
    
    // Check for experimental features
    if (content.includes('experimental')) {
      console.log(`  Has experimental config: ✅`);
    }
  } else {
    console.log(`  No Next.js config file found`);
  }
  
  console.log('');
}

async function main() {
  console.log('🔬 Cache Diagnostic Tool\n');
  console.log('='.repeat(80));
  console.log('');
  
  await checkBuildCache();
  await checkDataConsistency();
  await checkPageConfiguration();
  await checkNextConfig();
  await checkBrowserCacheInstructions();
  
  console.log('='.repeat(80));
  console.log('\n💡 Recommendations:');
  console.log('');
  console.log('If build cache is stale:');
  console.log('  rm -rf .next && npm run build');
  console.log('');
  console.log('If using ISR and need to revalidate:');
  console.log('  - Wait for revalidate time to pass');
  console.log('  - Or trigger revalidation via API route');
  console.log('');
  console.log('If it\'s browser cache:');
  console.log('  - Use incognito mode');
  console.log('  - Or clear browser cache');
  console.log('');
  console.log('To test the actual page:');
  console.log('  - Check Network tab in DevTools');
  console.log('  - Look at response headers');
  console.log('  - Check the actual HTML content');
  console.log('');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

