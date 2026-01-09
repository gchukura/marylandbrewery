#!/usr/bin/env tsx

/**
 * Test script to verify county page logic
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { slugify, deslugify } from '../src/lib/data-utils';
import { getBreweryDataFromSupabase } from '../lib/supabase-client';
import { processBreweryData } from '../lib/brewery-data';

async function testCountyLogic() {
  console.log('🔍 Testing County Page Logic\n');
  console.log('='.repeat(80));
  
  // Simulate the exact code from the page
  const county = 'anne-arundel-md';
  console.log(`\n1. Input county parameter: "${county}"`);
  
  // Strip -md suffix (exact code from page)
  let countySlugFromParam = county;
  if (countySlugFromParam.endsWith('-md')) {
    countySlugFromParam = countySlugFromParam.slice(0, -3);
    console.log(`   ✓ endsWith('-md') check: TRUE`);
    console.log(`   ✓ After slice(0, -3): "${countySlugFromParam}"`);
  } else {
    console.log(`   ✗ endsWith('-md') check: FALSE`);
    console.log(`   ✗ countySlugFromParam unchanged: "${countySlugFromParam}"`);
  }
  
  // Deslugify
  const countyName = deslugify(countySlugFromParam);
  console.log(`\n2. After deslugify: "${countyName}"`);
  
  // Get county key
  const countyKey = countyName.toLowerCase();
  console.log(`3. County key for filtering: "${countyKey}"`);
  
  // Fetch actual data
  console.log(`\n4. Fetching brewery data...`);
  const breweries = await getBreweryDataFromSupabase();
  const processed = await processBreweryData(breweries);
  
  // Filter breweries
  const filteredBreweries = processed.breweries.filter(b => {
    const breweryCounty = (b as any).county;
    return breweryCounty && breweryCounty.toLowerCase() === countyKey;
  });
  
  console.log(`   Found ${filteredBreweries.length} breweries`);
  
  if (filteredBreweries.length > 0) {
    console.log(`   Sample breweries:`);
    filteredBreweries.slice(0, 3).forEach(b => {
      console.log(`     - ${b.name} (county: "${(b as any).county}")`);
    });
  } else {
    console.log(`   ⚠️  No breweries found!`);
    console.log(`   Checking what county values exist in database...`);
    
    const allCounties = new Set<string>();
    processed.breweries.forEach((b: any) => {
      if (b.county) {
        allCounties.add(b.county);
      }
    });
    
    const matchingCounties = Array.from(allCounties).filter(c => 
      c.toLowerCase().includes('anne') || c.toLowerCase().includes('arundel')
    );
    
    console.log(`   Counties containing 'anne' or 'arundel':`);
    matchingCounties.forEach(c => {
      console.log(`     - "${c}" (lowercase: "${c.toLowerCase()}")`);
      console.log(`       Matches "${countyKey}"? ${c.toLowerCase() === countyKey}`);
    });
  }
  
  // Test hero image path
  console.log(`\n5. Testing hero image path...`);
  const countySlug = slugify(countyName);
  console.log(`   countyName: "${countyName}"`);
  console.log(`   countySlug: "${countySlug}"`);
  console.log(`   Expected image path: "/counties/${countySlug}.jpg"`);
  
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const imagePath = join(process.cwd(), 'public', 'counties', `${countySlug}.jpg`);
  const imageExists = existsSync(imagePath);
  console.log(`   Image exists: ${imageExists ? '✅' : '❌'}`);
  if (imageExists) {
    console.log(`   Full path: ${imagePath}`);
  }
  
  console.log(`\n` + '='.repeat(80));
  console.log(`\n✅ Test complete`);
}

testCountyLogic().catch(console.error);

