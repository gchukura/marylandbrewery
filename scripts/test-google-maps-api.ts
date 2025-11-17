/**
 * Test Google Maps API Key
 * 
 * This script tests if your Google Maps API key is valid and properly configured.
 * 
 * Usage:
 *   npx tsx scripts/test-google-maps-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

async function testApiKey() {
  console.log('🔍 Testing Google Maps API Key...\n');

  if (!API_KEY) {
    console.error('❌ ERROR: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found in .env.local');
    console.log('\nPlease add it to your .env.local file:');
    console.log('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here\n');
    process.exit(1);
  }

  console.log(`✓ API Key found: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`✓ API Key length: ${API_KEY.length} characters\n`);

  // Test 1: Check if key format is valid
  if (!API_KEY.startsWith('AIza')) {
    console.warn('⚠️  WARNING: API key should start with "AIza"');
  }

  // Test 2: Try to load the Maps JavaScript API
  console.log('📡 Testing API key with Google Maps JavaScript API...\n');
  
  const testUrl = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
  
  try {
    const response = await fetch(testUrl);
    const text = await response.text();

    if (response.ok && text.includes('function')) {
      console.log('✅ SUCCESS: API key is valid and Maps JavaScript API is accessible!\n');
      console.log('The API key appears to be working correctly.');
      console.log('\nIf you\'re still seeing errors in the browser:');
      console.log('1. Check API key restrictions in Google Cloud Console');
      console.log('2. Ensure Maps JavaScript API is enabled');
      console.log('3. Verify billing is enabled');
      console.log('4. Check browser console for specific error messages\n');
    } else if (text.includes('error_message')) {
      // Parse error from response
      const errorMatch = text.match(/error_message["\s]*:["\s]*([^"\\]+)/);
      const error = errorMatch ? errorMatch[1] : 'Unknown error';
      console.error(`❌ ERROR: ${error}\n`);
      
      if (error.includes('RefererNotAllowed')) {
        console.log('💡 SOLUTION: Add your domain to API key restrictions:');
        console.log('   - Go to Google Cloud Console → Credentials');
        console.log('   - Click on your API key');
        console.log('   - Under "Application restrictions", add:');
        console.log('     • localhost:3000/*');
        console.log('     • *.vercel.app/*');
        console.log('     • yourdomain.com/*\n');
      } else if (error.includes('ApiNotActivated')) {
        console.log('💡 SOLUTION: Enable Maps JavaScript API:');
        console.log('   - Go to Google Cloud Console → APIs & Services → Library');
        console.log('   - Search for "Maps JavaScript API"');
        console.log('   - Click "Enable"\n');
      } else if (error.includes('InvalidKey')) {
        console.log('💡 SOLUTION: Check that your API key is correct');
        console.log('   - Verify you copied the full key');
        console.log('   - Check for extra spaces or quotes\n');
      }
    } else {
      console.error('❌ ERROR: Unexpected response from Google Maps API');
      console.log('Response:', text.substring(0, 200));
    }
  } catch (error: any) {
    console.error('❌ ERROR: Failed to test API key');
    console.error('Error:', error.message);
    console.log('\nThis might be a network issue. Please check your internet connection.\n');
  }
}

testApiKey().catch(console.error);

