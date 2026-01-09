/**
 * Analyze and Store Review Themes Script
 *
 * This script:
 * 1. Reads Google reviews from the `reviews` table for each brewery
 * 2. Analyzes review text to extract 5 theme categories:
 *    - Beer Quality & Selection
 *    - Food & Menu
 *    - Service & Staff
 *    - Atmosphere & Ambiance
 *    - Amenities (structured data)
 * 3. Stores the extracted themes in the `review_themes` JSONB column
 *
 * Usage:
 *   npx tsx scripts/analyze-and-store-review-themes.ts
 *   npx tsx scripts/analyze-and-store-review-themes.ts --brewery-id=abc123
 *
 * Env required in `.env.local`:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

if (!supabaseAdmin) {
  throw new Error('Supabase admin client not available');
}

const client = supabaseAdmin;

// ============================================
// THEME PATTERN DEFINITIONS
// ============================================

// Theme 1: Beer Quality & Selection
const BEER_QUALITY_PATTERNS = [
  // Positive quality indicators
  { pattern: /\b(great|excellent|amazing|fantastic|awesome|best|quality|fresh|delicious|tasty|good)\s+(beer|brew|ipa|lager|stout|ale|pilsner|porter|selection)/gi, weight: 1.0 },
  { pattern: /\b(beer|brew)s?\s+(is|are|was|were)\s+(great|excellent|amazing|fantastic|awesome|fresh|delicious|tasty|good)/gi, weight: 1.0 },
  { pattern: /\b(wide|huge|great|excellent|good|nice|solid)\s+(selection|variety|choice|range)/gi, weight: 0.8 },
  { pattern: /\b(rotating|seasonal|special|limited)\s+(tap|release|beer|brew)/gi, weight: 0.7 },
  { pattern: /\b(ipa|lager|stout|porter|pilsner|sour|hazy|pale ale|wheat|amber|hefeweizen)/gi, weight: 0.5 },
  { pattern: /\b(flight|sampler|tasting)\b/gi, weight: 0.6 },
  { pattern: /\b(craft|micro|local)\s*brew/gi, weight: 0.5 },
  { pattern: /\b(well[- ]?crafted|perfectly\s+balanced|smooth|crisp|hoppy|malty)/gi, weight: 0.8 },
];

// Theme 2: Food & Menu
const FOOD_MENU_PATTERNS = [
  { pattern: /\b(great|excellent|amazing|delicious|tasty|good|best)\s+(food|menu|kitchen|pizza|burger|wings|appetizer|entree|meal)/gi, weight: 1.0 },
  { pattern: /\b(food|menu)\s+(is|are|was|were)\s+(great|excellent|amazing|delicious|tasty|good)/gi, weight: 1.0 },
  { pattern: /\b(food truck|food-truck)/gi, weight: 0.8 },
  { pattern: /\b(full kitchen|full menu|in-house kitchen)/gi, weight: 0.9 },
  { pattern: /\b(pizza|burger|wings|nachos|pretzel|tacos|sandwich|salad|fries)/gi, weight: 0.6 },
  { pattern: /\b(appetizer|entree|dinner|lunch|brunch)/gi, weight: 0.6 },
  { pattern: /\b(pair|pairing)\s+(well|perfectly|great)\s+with/gi, weight: 0.7 },
];

// Theme 3: Service & Staff
const SERVICE_STAFF_PATTERNS = [
  { pattern: /\b(friendly|helpful|knowledgeable|attentive|great|excellent|amazing|awesome|nice|welcoming)\s+(staff|server|bartender|employee|team|service)/gi, weight: 1.0 },
  { pattern: /\b(staff|server|bartender|employee|service)\s+(is|are|was|were)\s+(friendly|helpful|knowledgeable|attentive|great|excellent|amazing|awesome|nice|welcoming)/gi, weight: 1.0 },
  { pattern: /\b(great|excellent|good|amazing|awesome|fantastic)\s+service/gi, weight: 1.0 },
  { pattern: /\b(quick|fast|prompt)\s+service/gi, weight: 0.7 },
  { pattern: /\b(owner|manager)\s+(is|was|were)?\s*(friendly|helpful|nice|great)/gi, weight: 0.8 },
  { pattern: /\b(welcom(e|ing)|hospitality|customer service)/gi, weight: 0.7 },
];

// Theme 4: Atmosphere & Ambiance
const ATMOSPHERE_PATTERNS = [
  { pattern: /\b(great|excellent|amazing|awesome|cool|nice|relaxed|chill|cozy|fun|lively|vibrant)\s+(atmosphere|vibe|ambiance|environment|setting|space|place)/gi, weight: 1.0 },
  { pattern: /\b(atmosphere|vibe|ambiance)\s+(is|are|was|were)\s+(great|excellent|amazing|awesome|cool|nice|relaxed|chill|cozy|fun|lively)/gi, weight: 1.0 },
  { pattern: /\b(cozy|comfortable|relaxing|laid[- ]?back|casual|upscale|trendy|rustic|industrial)/gi, weight: 0.7 },
  { pattern: /\b(live music|band|musician|concert|entertainment|trivia|game|cornhole)/gi, weight: 0.8 },
  { pattern: /\b(decor|decoration|design|interior)\s+(is|was)?\s*(great|nice|cool|unique)/gi, weight: 0.6 },
  { pattern: /\b(view|scenic|beautiful|location)/gi, weight: 0.6 },
  { pattern: /\b(clean|well[- ]?maintained|spotless)/gi, weight: 0.5 },
];

// Theme 5: Amenities (for structured extraction)
const AMENITY_PATTERNS = {
  allows_visitors: [
    { pattern: /\b(visit|visited|stop by|stopped by|came here|went here|been here)/gi, weight: 1.0 },
  ],
  offers_tours: [
    { pattern: /\b(brewery tour|tour of the|took a tour|guided tour|behind the scenes)/gi, weight: 1.0 },
    { pattern: /\btour(s)?\b/gi, weight: 0.6 },
  ],
  beer_to_go: [
    { pattern: /\b(growler|crowler|can|cans|4[- ]?pack|six[- ]?pack|to[- ]?go|take home)/gi, weight: 1.0 },
  ],
  has_merch: [
    { pattern: /\b(merch|merchandise|swag|t[- ]?shirt|hoodie|hat|cap|glassware|pint glass)/gi, weight: 1.0 },
  ],
  dog_friendly: [
    { pattern: /\b(dog[- ]?friendly|pet[- ]?friendly|dogs? allowed|brought? (my |our )?dog|pup)/gi, weight: 1.0 },
  ],
  outdoor_seating: [
    { pattern: /\b(outdoor seating|outside seating|patio|beer garden|rooftop|deck|picnic table)/gi, weight: 1.0 },
  ],
  food: {
    in_house: [
      { pattern: /\b(full kitchen|kitchen|menu|dinner|lunch|entree|appetizer)/gi, weight: 1.0 },
      { pattern: /\b(pizza|burger|wings|nachos|tacos|sandwich)/gi, weight: 0.7 },
    ],
    food_trucks: [
      { pattern: /\b(food truck|food-truck)/gi, weight: 1.0 },
    ],
  },
  other_drinks: [
    { pattern: /\b(wine|cocktail|mixed drink|full bar|spirits|cider|seltzer|mead)/gi, weight: 1.0 },
  ],
  parking: [
    { pattern: /\b(parking|parking lot|street parking|plenty of parking|easy parking)/gi, weight: 1.0 },
  ],
};

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

interface ThemeResult {
  detected: boolean;
  score: number;
  keywords: string[];
  matchCount: number;
}

interface AmenityResult {
  allows_visitors: boolean;
  offers_tours: boolean;
  beer_to_go: boolean;
  has_merch: boolean;
  dog_friendly: boolean;
  outdoor_seating: boolean;
  food: string | null; // "In-House", "Food Trucks", or null
  other_drinks: string; // "yes" or "no"
  parking: string; // "yes" or "no"
}

interface ReviewThemes {
  beer_quality: ThemeResult;
  food_menu: ThemeResult;
  service_staff: ThemeResult;
  atmosphere: ThemeResult;
  amenities: AmenityResult;
  last_analyzed: string;
  review_count_analyzed: number;
}

function analyzeTheme(
  text: string,
  patterns: Array<{ pattern: RegExp; weight: number }>
): ThemeResult {
  const keywords: string[] = [];
  let totalScore = 0;
  let matchCount = 0;

  for (const { pattern, weight } of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matchCount += matches.length;
      totalScore += matches.length * weight;
      // Extract unique keywords (limit to 5)
      matches.slice(0, 3).forEach(m => {
        const cleaned = m.toLowerCase().trim();
        if (!keywords.includes(cleaned) && keywords.length < 5) {
          keywords.push(cleaned);
        }
      });
    }
  }

  // Normalize score (0-1 range based on review length)
  const textLength = text.split(/\s+/).length;
  const normalizedScore = Math.min(1, totalScore / Math.max(10, textLength / 100));

  return {
    detected: matchCount > 0,
    score: Math.round(normalizedScore * 100) / 100,
    keywords,
    matchCount,
  };
}

function analyzeAmenities(text: string): AmenityResult {
  const t = text.toLowerCase();

  // Check each amenity
  const checkAmenity = (patterns: Array<{ pattern: RegExp; weight: number }>): boolean => {
    return patterns.some(({ pattern }) => pattern.test(t));
  };

  // Food detection (In-House vs Food Trucks)
  let food: string | null = null;
  if (checkAmenity(AMENITY_PATTERNS.food.in_house)) {
    food = 'In-House';
  } else if (checkAmenity(AMENITY_PATTERNS.food.food_trucks)) {
    food = 'Food Trucks';
  }

  return {
    allows_visitors: checkAmenity(AMENITY_PATTERNS.allows_visitors),
    offers_tours: checkAmenity(AMENITY_PATTERNS.offers_tours),
    beer_to_go: checkAmenity(AMENITY_PATTERNS.beer_to_go),
    has_merch: checkAmenity(AMENITY_PATTERNS.has_merch),
    dog_friendly: checkAmenity(AMENITY_PATTERNS.dog_friendly),
    outdoor_seating: checkAmenity(AMENITY_PATTERNS.outdoor_seating),
    food,
    other_drinks: checkAmenity(AMENITY_PATTERNS.other_drinks) ? 'yes' : 'no',
    parking: checkAmenity(AMENITY_PATTERNS.parking) ? 'yes' : 'no',
  };
}

function analyzeReviews(reviews: Array<{ review_text: string | null }>): ReviewThemes {
  // Combine all review text
  const combinedText = reviews
    .map(r => r.review_text || '')
    .filter(t => t.length > 0)
    .join(' ');

  if (combinedText.length === 0) {
    return {
      beer_quality: { detected: false, score: 0, keywords: [], matchCount: 0 },
      food_menu: { detected: false, score: 0, keywords: [], matchCount: 0 },
      service_staff: { detected: false, score: 0, keywords: [], matchCount: 0 },
      atmosphere: { detected: false, score: 0, keywords: [], matchCount: 0 },
      amenities: {
        allows_visitors: false,
        offers_tours: false,
        beer_to_go: false,
        has_merch: false,
        dog_friendly: false,
        outdoor_seating: false,
        food: null,
        other_drinks: 'no',
        parking: 'no',
      },
      last_analyzed: new Date().toISOString(),
      review_count_analyzed: 0,
    };
  }

  return {
    beer_quality: analyzeTheme(combinedText, BEER_QUALITY_PATTERNS),
    food_menu: analyzeTheme(combinedText, FOOD_MENU_PATTERNS),
    service_staff: analyzeTheme(combinedText, SERVICE_STAFF_PATTERNS),
    atmosphere: analyzeTheme(combinedText, ATMOSPHERE_PATTERNS),
    amenities: analyzeAmenities(combinedText),
    last_analyzed: new Date().toISOString(),
    review_count_analyzed: reviews.length,
  };
}

// ============================================
// MAIN SCRIPT
// ============================================

async function analyzeAndStoreThemes() {
  console.log('🔍 Analyzing and Storing Review Themes\n');

  // Check for specific brewery ID argument
  const breweryIdArg = process.argv.find(arg => arg.startsWith('--brewery-id='));
  const specificBreweryId = breweryIdArg ? breweryIdArg.split('=')[1] : null;

  // Step 1: Fetch breweries
  console.log('📋 Step 1: Fetching breweries...');
  let breweriesQuery = client
    .from('breweries')
    .select('id, name');

  if (specificBreweryId) {
    breweriesQuery = breweriesQuery.eq('id', specificBreweryId);
    console.log(`   Filtering to brewery ID: ${specificBreweryId}`);
  }

  const { data: breweries, error: breweriesError } = await breweriesQuery;

  if (breweriesError) {
    throw new Error(`Failed to fetch breweries: ${breweriesError.message}`);
  }

  if (!breweries || breweries.length === 0) {
    console.log('   ℹ️  No breweries found');
    return;
  }

  console.log(`   ✓ Found ${breweries.length} breweries\n`);

  // Step 2: Process each brewery
  console.log('🔬 Step 2: Analyzing reviews for each brewery...\n');

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errorCount = 0;

  for (const brewery of breweries) {
    processed++;
    console.log(`[${processed}/${breweries.length}] ${brewery.name}`);

    try {
      // Fetch reviews for this brewery
      const { data: reviews, error: reviewsError } = await client
        .from('reviews')
        .select('review_text')
        .eq('brewery_id', brewery.id)
        .not('review_text', 'is', null);

      if (reviewsError) {
        console.error(`   ✗ Error fetching reviews: ${reviewsError.message}`);
        errorCount++;
        continue;
      }

      if (!reviews || reviews.length === 0) {
        console.log('   ⊘ No reviews found; skipping');
        skipped++;
        console.log('');
        continue;
      }

      console.log(`   📖 Analyzing ${reviews.length} reviews...`);

      // Analyze reviews
      const themes = analyzeReviews(reviews);

      // Log detected themes
      const detectedThemes: string[] = [];
      if (themes.beer_quality.detected) detectedThemes.push(`Beer Quality (${themes.beer_quality.score})`);
      if (themes.food_menu.detected) detectedThemes.push(`Food & Menu (${themes.food_menu.score})`);
      if (themes.service_staff.detected) detectedThemes.push(`Service & Staff (${themes.service_staff.score})`);
      if (themes.atmosphere.detected) detectedThemes.push(`Atmosphere (${themes.atmosphere.score})`);

      if (detectedThemes.length > 0) {
        console.log(`   🏷️  Themes: ${detectedThemes.join(', ')}`);
      }

      // Log detected amenities
      const detectedAmenities: string[] = [];
      if (themes.amenities.allows_visitors) detectedAmenities.push('visitors');
      if (themes.amenities.offers_tours) detectedAmenities.push('tours');
      if (themes.amenities.beer_to_go) detectedAmenities.push('beer-to-go');
      if (themes.amenities.has_merch) detectedAmenities.push('merch');
      if (themes.amenities.dog_friendly) detectedAmenities.push('dog-friendly');
      if (themes.amenities.outdoor_seating) detectedAmenities.push('outdoor');
      if (themes.amenities.food) detectedAmenities.push(`food:${themes.amenities.food}`);
      if (themes.amenities.other_drinks === 'yes') detectedAmenities.push('other-drinks');
      if (themes.amenities.parking === 'yes') detectedAmenities.push('parking');

      if (detectedAmenities.length > 0) {
        console.log(`   🎯 Amenities: ${detectedAmenities.join(', ')}`);
      }

      // Update brewery with themes
      const { error: updateError } = await client
        .from('breweries')
        .update({ review_themes: themes })
        .eq('id', brewery.id);

      if (updateError) {
        console.error(`   ✗ Error updating brewery: ${updateError.message}`);
        errorCount++;
      } else {
        updated++;
        console.log(`   ✅ Stored themes in database`);
      }

    } catch (error) {
      console.error(`   ✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      errorCount++;
    }

    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('\n📊 Analysis Summary:');
  console.log(`   - Breweries processed: ${processed}`);
  console.log(`   - Themes stored: ${updated}`);
  console.log(`   - Skipped (no reviews): ${skipped}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log('\n✅ Review theme analysis complete!');
}

// Run the script
analyzeAndStoreThemes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

