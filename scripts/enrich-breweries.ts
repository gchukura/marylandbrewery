/**
 * Enrich Breweries Script
 * 
 * This script:
 * 1. Fetches all breweries from Supabase
 * 2. Uses Google Places API to find Place IDs
 * 3. Calls Place Details API to get hours, phone, website
 * 4. Attempts to find social media links from website (if available)
 * 5. Updates Supabase with enriched data
 * 
 * Usage:
 *   npx tsx scripts/enrich-breweries.ts
 * 
 * Make sure to set environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or GOOGLE_MAPS_API_KEY)
 * 
 * Required APIs in Google Cloud Console:
 *   - Places API (Text Search)
 *   - Places API (Place Details)
 */

// Load environment variables from .env.local BEFORE any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import other modules
import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';

// Check if admin client is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local');
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  throw new Error('Google Maps API key is required. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY in .env.local');
}

// Get admin client
const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error('Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.');
}

const client = adminClient as NonNullable<typeof adminClient>;

/**
 * Build search query from brewery data
 */
function buildSearchQuery(brewery: { name?: string | null; city?: string | null; state?: string | null }): string {
  const parts: string[] = [];
  
  if (brewery.name) {
    parts.push(brewery.name);
  }
  
  if (brewery.city) {
    parts.push(brewery.city);
  }
  if (brewery.state) {
    parts.push(brewery.state);
  }
  
  return parts.join(', ');
}

/**
 * Find Place ID using Places API Text Search
 */
async function findPlaceId(query: string): Promise<string | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].place_id;
    }
    
    return null;
  } catch (error) {
    console.warn(`  ⚠️  Error finding Place ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get photo URL from Google Places API photo reference
 */
function getPhotoUrl(photoReference: string, maxWidth: number = 1200): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

/**
 * Get Place Details from Google Places API
 */
async function getPlaceDetails(placeId: string): Promise<{
  hours?: Record<string, string>;
  phone?: string;
  website?: string;
  photoUrl?: string;
} | null> {
  try {
    // Request specific fields including photos
    const fields = 'opening_hours,formatted_phone_number,international_phone_number,website,photos';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const enriched: {
        hours?: Record<string, string>;
        phone?: string;
        website?: string;
        photoUrl?: string;
      } = {};
      
      // Parse opening hours
      if (result.opening_hours && result.opening_hours.weekday_text) {
        const hours: Record<string, string> = {};
        
        // Google returns weekday_text as array of strings like "Monday: 11:00 AM – 10:00 PM"
        result.opening_hours.weekday_text.forEach((dayText: string) => {
          const match = dayText.match(/^(\w+):\s*(.+)$/);
          if (match) {
            const dayName = match[1].toLowerCase();
            const hoursText = match[2].trim();
            
            // Map to our day names
            const dayMap: Record<string, string> = {
              'sunday': 'sunday',
              'monday': 'monday',
              'tuesday': 'tuesday',
              'wednesday': 'wednesday',
              'thursday': 'thursday',
              'friday': 'friday',
              'saturday': 'saturday',
            };
            
            const dayKey = dayMap[dayName];
            if (dayKey && hoursText !== 'Closed') {
              hours[dayKey] = hoursText;
            }
          }
        });
        
        if (Object.keys(hours).length > 0) {
          enriched.hours = hours;
        }
      }
      
      // Get phone number (prefer formatted, fallback to international)
      if (result.formatted_phone_number) {
        enriched.phone = result.formatted_phone_number;
      } else if (result.international_phone_number) {
        enriched.phone = result.international_phone_number;
      }
      
      // Get website
      if (result.website) {
        enriched.website = result.website;
      }
      
      // Get first photo (usually the best/main photo)
      if (result.photos && result.photos.length > 0) {
        const firstPhoto = result.photos[0];
        if (firstPhoto.photo_reference) {
          // Get a high-quality photo (1200px width is a good balance)
          enriched.photoUrl = getPhotoUrl(firstPhoto.photo_reference, 1200);
        }
      }
      
      return enriched;
    } else if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied.';
      throw new Error(`Place Details API request denied: ${errorMsg}`);
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      throw error;
    }
    console.warn(`  ⚠️  Error getting Place Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Extract social media links from website HTML
 * This is a simple regex-based approach - for production, consider using a proper HTML parser
 */
async function extractSocialMediaFromWebsite(website: string): Promise<Record<string, string>> {
  const socialMedia: Record<string, string> = {};
  
  try {
    // Fetch the website
    const response = await fetch(website, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BreweryDirectoryBot/1.0)',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return socialMedia;
    }
    
    const html = await response.text();
    
    // Common social media patterns
    const patterns = {
      facebook: [
        /https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/([a-zA-Z0-9.]+)/gi,
        /https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/pages\/[^\/]+\/(\d+)/gi,
      ],
      instagram: [
        /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi,
      ],
      twitter: [
        /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi,
      ],
    };
    
    // Extract Facebook
    for (const pattern of patterns.facebook) {
      const match = html.match(pattern);
      if (match && match[0]) {
        socialMedia.facebook = match[0];
        break;
      }
    }
    
    // Extract Instagram
    for (const pattern of patterns.instagram) {
      const match = html.match(pattern);
      if (match && match[0]) {
        socialMedia.instagram = match[0];
        break;
      }
    }
    
    // Extract Twitter/X
    for (const pattern of patterns.twitter) {
      const match = html.match(pattern);
      if (match && match[0]) {
        socialMedia.twitter = match[0];
        break;
      }
    }
  } catch (error) {
    // Silently fail - website might not be accessible or timeout
    // In production, you might want to log this
  }
  
  return socialMedia;
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main enrichment function
 */
async function enrichBreweries() {
  console.log('🚀 Starting brewery enrichment...\n');
  console.log('📋 Using Places API to enrich hours, phone, website, and social media\n');

  try {
    // Step 1: Fetch all breweries from Supabase
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, name, street, city, state, zip, phone, website, hours, social_media, photo_url')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }
    
    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }
    
    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 2: Enrich each brewery
    console.log('🌍 Step 2: Enriching brewery data...');
    console.log('   (Rate limited to ~40 requests/second to stay within Google API limits)\n');
    
    let hoursUpdated = 0;
    let phoneUpdated = 0;
    let websiteUpdated = 0;
    let socialMediaUpdated = 0;
    let photoUpdated = 0;
    let skipped = 0;
    let errorCount = 0;
    let requestDeniedError: Error | null = null;
    
    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      const query = buildSearchQuery(brewery);
      
      console.log(`[${i + 1}/${breweries.length}] Enriching: ${brewery.name}`);
      console.log(`   Query: ${query}`);
      
      try {
        // Find Place ID
        const placeId = await findPlaceId(query);
        
        if (!placeId) {
          console.log(`   ⚠️  Could not find Place ID`);
          skipped++;
          console.log('');
          continue;
        }
        
        console.log(`   ✓ Found Place ID: ${placeId}`);
        
        // Get Place Details
        const details = await getPlaceDetails(placeId);
        
        if (!details) {
          console.log(`   ⚠️  Could not get Place Details`);
          skipped++;
          console.log('');
          continue;
        }
        
        // Prepare update object
        const updates: Partial<DatabaseBrewery> = {};
        let hasUpdates = false;
        
        // Update hours if available and different
        if (details.hours && Object.keys(details.hours).length > 0) {
          const currentHours = (brewery.hours as Record<string, string>) || {};
          const hoursChanged = JSON.stringify(currentHours) !== JSON.stringify(details.hours);
          
          if (hoursChanged) {
            updates.hours = details.hours;
            hasUpdates = true;
            hoursUpdated++;
            console.log(`   ✓ Hours updated`);
          }
        }
        
        // Update phone if available and different
        if (details.phone && details.phone !== brewery.phone) {
          updates.phone = details.phone;
          hasUpdates = true;
          phoneUpdated++;
          console.log(`   ✓ Phone updated: ${details.phone}`);
        }
        
        // Update website if available and different
        if (details.website && details.website !== brewery.website) {
          updates.website = details.website;
          hasUpdates = true;
          websiteUpdated++;
          console.log(`   ✓ Website updated: ${details.website}`);
        }
        
        // Update photo if available and different
        if (details.photoUrl && details.photoUrl !== brewery.photo_url) {
          updates.photo_url = details.photoUrl;
          hasUpdates = true;
          photoUpdated++;
          console.log(`   ✓ Photo updated`);
        }
        
        // Try to extract social media from website
        let socialMedia: Record<string, string> = {};
        if (details.website) {
          console.log(`   🔍 Extracting social media from website...`);
          socialMedia = await extractSocialMediaFromWebsite(details.website);
          
          if (Object.keys(socialMedia).length > 0) {
            const currentSocial = (brewery.social_media as Record<string, string>) || {};
            const mergedSocial = { ...currentSocial, ...socialMedia };
            const socialChanged = JSON.stringify(currentSocial) !== JSON.stringify(mergedSocial);
            
            if (socialChanged) {
              updates.social_media = mergedSocial;
              hasUpdates = true;
              socialMediaUpdated++;
              console.log(`   ✓ Social media found: ${Object.keys(socialMedia).join(', ')}`);
            }
          } else {
            console.log(`   ℹ️  No social media links found on website`);
          }
        }
        
        // Update database if we have changes
        if (hasUpdates) {
          const { error } = await client
            .from('breweries')
            .update(updates)
            .eq('id', brewery.id);
          
          if (error) {
            console.error(`   ✗ Error updating: ${error.message}`);
            errorCount++;
          } else {
            console.log(`   ✅ Successfully updated in database`);
          }
        } else {
          console.log(`   ⊘ No updates needed`);
          skipped++;
        }
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
          requestDeniedError = error;
          console.error(`   ✗ ${error.message}`);
          console.error(`\n   ⚠️  API REQUEST DENIED - Check your Google Cloud Console settings.`);
          errorCount++;
          
          if (i === 0) {
            console.error(`\n   Stopping script due to API access issues.`);
            throw error;
          }
        } else {
          console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Rate limiting: Wait 25ms between requests = 40 requests/second
      if (i < breweries.length - 1) {
        await sleep(25);
      }
      
      console.log(''); // Empty line for readability
    }
    
    if (requestDeniedError) {
      console.error(`\n❌ Script encountered API access issues.`);
      throw requestDeniedError;
    }
    
    console.log(`\n📊 Enrichment Summary:`);
    console.log(`   ✓ Hours updated: ${hoursUpdated}`);
    console.log(`   ✓ Phone updated: ${phoneUpdated}`);
    console.log(`   ✓ Website updated: ${websiteUpdated}`);
    console.log(`   ✓ Social media updated: ${socialMediaUpdated}`);
    console.log(`   ✓ Photo updated: ${photoUpdated}`);
    console.log(`   ⊘ Skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    console.log('🎉 Enrichment completed successfully!');
    console.log(`\nFinal Summary:`);
    console.log(`  - Total breweries processed: ${breweries.length}`);
    console.log(`  - Hours updated: ${hoursUpdated}`);
    console.log(`  - Phone updated: ${phoneUpdated}`);
    console.log(`  - Website updated: ${websiteUpdated}`);
    console.log(`  - Social media updated: ${socialMediaUpdated}`);
    console.log(`  - Photo updated: ${photoUpdated}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    if (error instanceof Error && error.message.includes('REQUEST_DENIED')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Go to Google Cloud Console → APIs & Services → Library');
      console.error('2. Enable "Places API"');
      console.error('3. Go to APIs & Services → Credentials');
      console.error('4. Edit your API key and check restrictions');
      console.error('5. For server-side scripts, you may need to:');
      console.error('   - Set Application restrictions to "None" temporarily, OR');
      console.error('   - Create a separate API key for server-side use');
      console.error('6. Ensure billing is enabled (required even for free tier)');
    }
    process.exit(1);
  }
}

// Run enrichment
enrichBreweries().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

