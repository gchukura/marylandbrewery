/**
 * Enrich Supabase Breweries Script
 * 
 * This script enriches Supabase breweries table with:
 * 1. Social media handles (from website scraping)
 * 2. Hours of operation (from Google Places API)
 * 
 * Supabase is the PRIMARY source - no Google Sheets dependency
 * 
 * Usage:
 *   npx tsx scripts/enrich-supabase-breweries.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';
import { getBreweryDataFromSupabase } from '../lib/supabase-client';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

interface SocialMediaData {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  untappd?: string;
}

interface HoursData {
  sunday?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
}

interface PlaceDetailsResponse {
  opening_hours?: {
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  place_id?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractSocialMediaFromWebsite(websiteUrl: string): Promise<SocialMediaData> {
  const socialMedia: SocialMediaData = {};

  try {
    let url = websiteUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BreweryDirectoryBot/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return socialMedia;

    const html = await response.text();

    // Extract Facebook
    const facebookMatch = html.match(/https?:\/\/(www\.)?(facebook|fb)\.com\/([a-zA-Z0-9.]+)/gi);
    if (facebookMatch) {
      const link = facebookMatch[0];
      if (!link.includes('share') && !link.includes('sharer')) {
        socialMedia.facebook = link.startsWith('http') ? link : `https://${link}`;
      }
    }

    // Extract Instagram
    const instagramMatch = html.match(/https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi);
    if (instagramMatch) {
      socialMedia.instagram = instagramMatch[0].startsWith('http') ? instagramMatch[0] : `https://${instagramMatch[0]}`;
    }

    // Extract Twitter/X
    const twitterMatch = html.match(/https?:\/\/(www\.)?(twitter|x)\.com\/([a-zA-Z0-9_]+)/gi);
    if (twitterMatch) {
      const normalized = twitterMatch[0].replace(/x\.com/, 'twitter.com');
      socialMedia.twitter = normalized.startsWith('http') ? normalized : `https://${normalized}`;
    }

    // Extract Untappd
    const untappdMatch = html.match(/https?:\/\/(www\.)?untappd\.com\/([a-zA-Z0-9_]+)/gi);
    if (untappdMatch) {
      socialMedia.untappd = untappdMatch[0].startsWith('http') ? untappdMatch[0] : `https://${untappdMatch[0]}`;
    }

  } catch (error) {
    // Silently fail
  }

  return socialMedia;
}

async function findPlaceId(breweryName: string, city?: string, state?: string): Promise<string | null> {
  if (!apiKey) return null;

  try {
    const query = [breweryName, city, state].filter(Boolean).join(', ');
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=establishment&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].place_id;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function getPlaceDetailsWithHours(placeId: string): Promise<PlaceDetailsResponse | null> {
  if (!apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,place_id&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function convertGoogleHoursToFormat(openingHours: PlaceDetailsResponse['opening_hours']): HoursData | null {
  if (!openingHours) return null;

  const hours: HoursData = {};

  if (openingHours.weekday_text && openingHours.weekday_text.length > 0) {
    const dayMap: Record<string, keyof HoursData> = {
      'Sunday': 'sunday',
      'Monday': 'monday',
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
    };

    for (const dayText of openingHours.weekday_text) {
      const match = dayText.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const dayName = match[1].trim();
        const hoursText = match[2].trim();
        const dayKey = dayMap[dayName];
        if (dayKey && hoursText && hoursText !== 'Closed') {
          hours[dayKey] = hoursText;
        }
      }
    }
  }

  return Object.keys(hours).length > 0 ? hours : null;
}

function mergeSocialMedia(current: SocialMediaData, newData: SocialMediaData): SocialMediaData {
  return {
    facebook: newData.facebook || current.facebook,
    instagram: newData.instagram || current.instagram,
    twitter: newData.twitter || current.twitter,
    untappd: newData.untappd || current.untappd,
  };
}

function mergeHours(current: HoursData, newData: HoursData): HoursData {
  return {
    sunday: newData.sunday || current.sunday,
    monday: newData.monday || current.monday,
    tuesday: newData.tuesday || current.tuesday,
    wednesday: newData.wednesday || current.wednesday,
    thursday: newData.thursday || current.thursday,
    friday: newData.friday || current.friday,
    saturday: newData.saturday || current.saturday,
  };
}

function hasSocialMedia(social: SocialMediaData): boolean {
  return !!(social.facebook || social.instagram || social.twitter || social.untappd);
}

function hasHours(hours: HoursData): boolean {
  return !!(hours.sunday || hours.monday || hours.tuesday || hours.wednesday || 
            hours.thursday || hours.friday || hours.saturday);
}

async function enrichSupabaseBreweries() {
  console.log('🚀 Starting Supabase breweries enrichment...\n');
  console.log('📋 Using Supabase as PRIMARY data source\n');

  try {
    const supabase = supabaseAdmin;
    if (!supabase) {
      throw new Error('Supabase admin client not available');
    }

    // Step 1: Fetch from Supabase (PRIMARY SOURCE)
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const breweries = await getBreweryDataFromSupabase();
    console.log(`   ✓ Found ${breweries.length} breweries\n`);

    if (breweries.length === 0) {
      console.log('   ⚠️  No breweries found in Supabase');
      return;
    }

    // Step 2: Enrich each brewery
    console.log('📤 Step 2: Enriching breweries...\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let socialFromWebsite = 0;
    let hoursFromPlaces = 0;

    for (let i = 0; i < breweries.length; i++) {
      const brewery = breweries[i];
      console.log(`[${i + 1}/${breweries.length}] ${brewery.name}`);

      try {
        const currentSocial = (brewery.socialMedia || {}) as SocialMediaData;
        const currentHours = (brewery.hours || {}) as HoursData;

        let finalSocial = { ...currentSocial };
        let finalHours = { ...currentHours };

        // Enrich social media from website if missing
        if (!hasSocialMedia(finalSocial) && brewery.website) {
          console.log(`   🔍 Extracting social media from website...`);
          const websiteSocial = await extractSocialMediaFromWebsite(brewery.website);
          if (hasSocialMedia(websiteSocial)) {
            finalSocial = mergeSocialMedia(finalSocial, websiteSocial);
            socialFromWebsite++;
            console.log(`   ✓ Found social media on website`);
          }
          await sleep(500);
        }

        // Enrich hours from Google Places if missing
        if (!hasHours(finalHours) && apiKey) {
          console.log(`   🔍 Fetching hours from Google Places...`);
          const placeId = await findPlaceId(brewery.name, brewery.city, brewery.state);

          if (placeId) {
            await sleep(100);
            const placeDetails = await getPlaceDetailsWithHours(placeId);
            
            if (placeDetails?.opening_hours) {
              const placesHours = convertGoogleHoursToFormat(placeDetails.opening_hours);
              if (placesHours && hasHours(placesHours)) {
                finalHours = mergeHours(finalHours, placesHours);
                hoursFromPlaces++;
                console.log(`   ✓ Found hours from Google Places`);
              }
            }
          }
          await sleep(100);
        }

        // Check if update is needed
        const socialChanged = JSON.stringify(finalSocial) !== JSON.stringify(currentSocial);
        const hoursChanged = JSON.stringify(finalHours) !== JSON.stringify(currentHours);

        if (!socialChanged && !hoursChanged) {
          console.log(`   ⏭️  No changes needed\n`);
          skipped++;
          continue;
        }

        // Update Supabase
        const updateData: any = {};
        if (socialChanged) {
          updateData.social_media = finalSocial;
        }
        if (hoursChanged) {
          updateData.hours = finalHours;
        }

        const { error: updateError } = await supabase
          .from('breweries')
          .update(updateData)
          .eq('id', brewery.id);

        if (updateError) {
          console.error(`   ✗ Failed to update: ${updateError.message}\n`);
          errors++;
        } else {
          const changes = [];
          if (socialChanged) changes.push('social media');
          if (hoursChanged) changes.push('hours');
          console.log(`   ✓ Updated: ${changes.join(', ')}\n`);
          updated++;
        }

      } catch (error) {
        console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        errors++;
      }
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   ✓ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ✗ Errors: ${errors}`);
    console.log(`\n📈 Data Sources:`);
    console.log(`   Social Media from Websites: ${socialFromWebsite}`);
    console.log(`   Hours from Google Places: ${hoursFromPlaces}\n`);

    console.log('🎉 Enrichment completed!');

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    process.exit(1);
  }
}

enrichSupabaseBreweries().catch(console.error);

