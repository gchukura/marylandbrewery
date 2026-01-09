#!/usr/bin/env tsx

/**
 * Verification script for -md suffixed pages
 * This script verifies that the logic for handling -md suffixed routes
 * works correctly without actually generating static pages.
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { slugify, deslugify } from '../src/lib/data-utils';
import { getBreweryDataFromSupabase } from '../lib/supabase-client';
import { processBreweryData } from '../lib/brewery-data';
import type { Brewery, ProcessedBreweryData } from '../src/types/brewery';

const ALL_MD_COUNTIES = [
  'Allegany', 'Anne Arundel', 'Baltimore', 'Calvert', 'Caroline', 'Carroll', 'Cecil', 'Charles',
  'Dorchester', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery',
  'Prince Georges', 'Queen Annes', 'Somerset', 'St Marys', 'Talbot', 'Washington', 'Wicomico', 'Worcester'
];

interface VerificationResult {
  county: string;
  originalSlug: string;
  mdSlug: string;
  extractedName: string;
  breweryCount: number;
  hasHeroImage: boolean;
  status: 'pass' | 'fail';
  error?: string;
}

async function verifyCountyPage(
  countyName: string, 
  processed: ProcessedBreweryData
): Promise<VerificationResult> {
  const originalSlug = slugify(countyName);
  const mdSlug = `${originalSlug}-md`;
  
  try {
    // Simulate the logic from the -md page
    const countySlugFromParam = mdSlug.replace(/-md$/, '');
    const extractedName = deslugify(countySlugFromParam);
    
    // Verify the extraction worked
    if (extractedName !== countyName) {
      return {
        county: countyName,
        originalSlug,
        mdSlug,
        extractedName,
        breweryCount: 0,
        hasHeroImage: false,
        status: 'fail',
        error: `Name mismatch: expected "${countyName}", got "${extractedName}"`
      };
    }
    
    // Filter breweries by county
    const countyKey = extractedName.toLowerCase();
    const breweries = processed.breweries.filter((b: any) => {
      const breweryCounty = b.county;
      return breweryCounty && breweryCounty.toLowerCase() === countyKey;
    });
    
    // Check for hero image
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    const countySlug = slugify(extractedName);
    const localCountyImageFile = join(resolve(process.cwd()), 'public', 'counties', `${countySlug}.jpg`);
    const hasHeroImage = existsSync(localCountyImageFile);
    
    return {
      county: countyName,
      originalSlug,
      mdSlug,
      extractedName,
      breweryCount: breweries.length,
      hasHeroImage,
      status: 'pass'
    };
  } catch (error) {
    return {
      county: countyName,
      originalSlug,
      mdSlug,
      extractedName: 'ERROR',
      breweryCount: 0,
      hasHeroImage: false,
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function verifyCityPage(
  cityName: string,
  processed: ProcessedBreweryData
): Promise<VerificationResult> {
  const originalSlug = slugify(cityName);
  const mdSlug = `${originalSlug}-md`;
  
  try {
    // Simulate the logic from the -md page
    const citySlugFromParam = mdSlug.replace(/-md$/, '');
    const extractedName = deslugify(citySlugFromParam);
    
    // Verify the extraction worked
    if (extractedName !== cityName) {
      return {
        county: cityName,
        originalSlug,
        mdSlug,
        extractedName,
        breweryCount: 0,
        hasHeroImage: false,
        status: 'fail',
        error: `Name mismatch: expected "${cityName}", got "${extractedName}"`
      };
    }
    
    // Filter breweries by city
    const cityKey = extractedName.toLowerCase();
    const breweries = processed.breweries.filter((b: any) => {
      const breweryCity = b.city;
      return breweryCity && breweryCity.toLowerCase() === cityKey;
    });
    
    // Check for hero image
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    const citySlug = slugify(extractedName);
    const localCityImageFile = join(resolve(process.cwd()), 'public', 'cities', `${citySlug}.jpg`);
    const hasHeroImage = existsSync(localCityImageFile);
    
    return {
      county: cityName,
      originalSlug,
      mdSlug,
      extractedName,
      breweryCount: breweries.length,
      hasHeroImage,
      status: 'pass'
    };
  } catch (error) {
    return {
      county: cityName,
      originalSlug,
      mdSlug,
      extractedName: 'ERROR',
      breweryCount: 0,
      hasHeroImage: false,
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


async function main() {
  console.log('🔍 Verifying -md suffixed pages...\n');
  
  // Fetch and process brewery data directly from Supabase
  console.log('📥 Fetching brewery data from Supabase...');
  const breweries = await getBreweryDataFromSupabase();
  const processed = await processBreweryData(breweries);
  console.log(`✅ Loaded ${breweries.length} breweries\n`);
  
  // Verify county pages
  console.log('📊 Verifying County Pages:');
  console.log('─'.repeat(80));
  
  const countyResults: VerificationResult[] = [];
  for (const county of ALL_MD_COUNTIES) {
    const result = await verifyCountyPage(county, processed);
    countyResults.push(result);
    
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const breweryInfo = result.breweryCount > 0 
      ? `${result.breweryCount} breweries` 
      : '0 breweries';
    const imageInfo = result.hasHeroImage ? '📷' : '🖼️ ';
    
    console.log(
      `${statusIcon} ${county.padEnd(20)} | ` +
      `Slug: ${result.originalSlug.padEnd(25)} | ` +
      `MD Slug: ${result.mdSlug.padEnd(30)} | ` +
      `Extracted: ${result.extractedName.padEnd(20)} | ` +
      `${breweryInfo.padEnd(15)} | ${imageInfo}`
    );
    
    if (result.error) {
      console.log(`   ⚠️  Error: ${result.error}`);
    }
  }
  
  console.log('\n');
  
  // Verify city pages (sample of top cities)
  console.log('📊 Verifying City Pages (Top 20 by brewery count):');
  console.log('─'.repeat(80));
  
  // Get cities with brewery counts
  const cityCounts = new Map<string, number>();
  processed.breweries.forEach((brewery: any) => {
    if (brewery.city) {
      const count = cityCounts.get(brewery.city) || 0;
      cityCounts.set(brewery.city, count + 1);
    }
  });
  
  // Sort by count and take top 20
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([city]) => city);
  
  const cityResults: VerificationResult[] = [];
  for (const city of topCities) {
    const result = await verifyCityPage(city, processed);
    cityResults.push(result);
    
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const breweryInfo = result.breweryCount > 0 
      ? `${result.breweryCount} breweries` 
      : '0 breweries';
    const imageInfo = result.hasHeroImage ? '📷' : '🖼️ ';
    
    console.log(
      `${statusIcon} ${city.padEnd(20)} | ` +
      `Slug: ${result.originalSlug.padEnd(25)} | ` +
      `MD Slug: ${result.mdSlug.padEnd(30)} | ` +
      `Extracted: ${result.extractedName.padEnd(20)} | ` +
      `${breweryInfo.padEnd(15)} | ${imageInfo}`
    );
    
    if (result.error) {
      console.log(`   ⚠️  Error: ${result.error}`);
    }
  }
  
  console.log('\n');
  
  // Summary
  const allResults = [...countyResults, ...cityResults];
  const passed = allResults.filter(r => r.status === 'pass').length;
  const failed = allResults.filter(r => r.status === 'fail').length;
  const totalBreweries = allResults.reduce((sum, r) => sum + r.breweryCount, 0);
  const withImages = allResults.filter(r => r.hasHeroImage).length;
  
  console.log('📈 Summary:');
  console.log('─'.repeat(80));
  console.log(`Total pages verified: ${allResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🍺 Total breweries found: ${totalBreweries}`);
  console.log(`📷 Pages with hero images: ${withImages}`);
  console.log(`🖼️  Pages without hero images: ${allResults.length - withImages}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some pages failed verification. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All pages passed verification!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

