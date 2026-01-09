/**
 * Test Yelp API Connection
 * 
 * Quick script to verify your Yelp API key is working
 * 
 * Usage:
 *   npx tsx scripts/test-yelp-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

const yelpApiKey = process.env.YELP_API_KEY;

if (!yelpApiKey) {
  console.error('❌ YELP_API_KEY not found in .env.local');
  console.error('   Please add your Yelp API key to .env.local');
  console.error('   Get your key from: https://www.yelp.com/developers/v3/manage_app');
  process.exit(1);
}

async function testYelpAPI() {
  console.log('🧪 Testing Yelp API connection...\n');
  
  try {
    // Test with a simple business search (searching for a well-known business)
    const testQuery = 'Starbucks';
    const testLocation = 'San Francisco, CA';
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(testQuery)}&location=${encodeURIComponent(testLocation)}&limit=1`;
    
    console.log(`📡 Making test API call...`);
    console.log(`   Query: "${testQuery}" in "${testLocation}"\n`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${yelpApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Authentication failed!');
        console.error('   Your YELP_API_KEY is invalid or expired.');
        console.error('   Please check your API key at: https://www.yelp.com/developers/v3/manage_app');
        process.exit(1);
      }
      if (response.status === 429) {
        console.error('❌ Rate limit exceeded!');
        console.error('   You\'ve hit the Yelp API rate limit. Please try again later.');
        process.exit(1);
      }
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status}`);
      console.error(`   ${errorText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    if (data.businesses && data.businesses.length > 0) {
      const business = data.businesses[0];
      console.log('✅ Yelp API connection successful!\n');
      console.log('📊 Test Results:');
      console.log(`   Business: ${business.name}`);
      console.log(`   Rating: ${business.rating} ⭐`);
      console.log(`   Reviews: ${business.review_count}`);
      console.log(`   Location: ${business.location.address1}, ${business.location.city}, ${business.location.state}`);
      console.log('\n🎉 Your Yelp API key is working correctly!');
      console.log('   You can now run: npx tsx scripts/fetch-yelp-reviews.ts');
    } else {
      console.log('⚠️  API call succeeded but no results found');
      console.log('   This might be a temporary issue. Try running the test again.');
    }
    
  } catch (error) {
    console.error('❌ Error testing Yelp API:');
    console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

testYelpAPI();

