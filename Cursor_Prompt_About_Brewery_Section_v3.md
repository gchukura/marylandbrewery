# CURSOR PROMPT: Enhanced About Brewery Section with Stored Review Themes

## Overview
Update the About Brewery section in `SimpleBreweryPageTemplateV2` to use stored review themes from the `breweries` table. This involves:
1. Adding a `review_themes` JSONB column to the breweries table
2. Creating a script to analyze reviews and extract themes
3. Using the stored themes in the About content generator

---

## PART 1: Update Breweries Table Schema

### Step 1A: Add review_themes Column to Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Add review_themes column to breweries table
-- Stores extracted themes as JSONB for flexibility
ALTER TABLE breweries 
ADD COLUMN IF NOT EXISTS review_themes JSONB DEFAULT '{}';

-- Add index for querying breweries by theme
CREATE INDEX IF NOT EXISTS idx_breweries_review_themes 
ON breweries USING GIN(review_themes);

-- Comment for documentation
COMMENT ON COLUMN breweries.review_themes IS 
'Extracted themes from Google/Yelp reviews. Structure: {
  "beer_quality": { "detected": true, "keywords": ["great ipas", "fresh beer"], "score": 0.85 },
  "food_menu": { "detected": true, "keywords": ["amazing food", "great menu"], "score": 0.72 },
  "service_staff": { "detected": true, "keywords": ["friendly staff"], "score": 0.90 },
  "atmosphere": { "detected": false, "keywords": [], "score": 0 },
  "amenities": { 
    "allows_visitors": true,
    "offers_tours": true,
    "beer_to_go": true,
    "has_merch": false,
    "dog_friendly": true,
    "outdoor_seating": true,
    "food": "In-House",
    "other_drinks": "yes",
    "parking": "yes"
  },
  "last_analyzed": "2025-01-01T00:00:00Z",
  "review_count_analyzed": 50
}';
```

---

## PART 2: Create Theme Analysis Script

### Step 2A: Create `scripts/analyze-and-store-review-themes.ts`

```typescript
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
```

---

## PART 3: Update Type Definitions

### Step 3A: Add ReviewThemes Type to `src/types/brewery.ts`

```typescript
/**
 * Review theme analysis result for a single theme category
 */
export interface ThemeResult {
  detected: boolean;
  score: number;
  keywords: string[];
  matchCount: number;
}

/**
 * Amenities extracted from reviews
 */
export interface ReviewAmenities {
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

/**
 * Complete review themes object stored in breweries.review_themes
 */
export interface ReviewThemes {
  beer_quality: ThemeResult;
  food_menu: ThemeResult;
  service_staff: ThemeResult;
  atmosphere: ThemeResult;
  amenities: ReviewAmenities;
  last_analyzed: string;
  review_count_analyzed: number;
}
```

### Step 3B: Update Brewery Interface

Add to the main `Brewery` interface:

```typescript
export interface Brewery {
  // ... existing fields ...
  
  // Review themes (extracted from reviews)
  reviewThemes?: ReviewThemes;
}
```

### Step 3C: Update `lib/supabase-client.ts` Conversion

In the `dbBreweryToBrewery` function, add:

```typescript
function dbBreweryToBrewery(dbBrewery: DatabaseBrewery, beers: Beer[] = []): Brewery {
  return {
    // ... existing fields ...
    
    // Review themes
    reviewThemes: dbBrewery.review_themes as ReviewThemes | undefined,
  };
}
```

---

## PART 4: Update Content Generator to Use Stored Themes

### Step 4A: Update `src/lib/brewery-content-utils.ts`

Replace the theme extraction functions with stored theme usage:

```typescript
// ============================================
// THEME FORMATTING FOR ABOUT SECTION
// ============================================

// Standardized theme category names for display (lowercase for natural sentence flow)
const THEME_DISPLAY_NAMES = {
  beer_quality: 'beer quality & selection',
  food_menu: 'food & menu',
  service_staff: 'service & staff',
  atmosphere: 'atmosphere & ambiance',
  // Amenity categories
  dog_friendly: 'dog-friendly environment',
  outdoor_seating: 'outdoor seating',
  offers_tours: 'brewery tours',
  beer_to_go: 'beer to-go',
  has_merch: 'merchandise',
  food_in_house: 'in-house kitchen',
  food_trucks: 'food trucks',
  other_drinks: 'wine & cocktails',
  parking: 'convenient parking',
} as const;

/**
 * Format stored themes into readable text for the About section
 * Uses standardized category names for consistency
 */
export function formatReviewThemesForAbout(
  breweryName: string,
  reviewThemes?: ReviewThemes
): string | null {
  if (!reviewThemes) return null;

  // Collect themes with scores above threshold (0.3)
  const SCORE_THRESHOLD = 0.3;
  const significantThemes: Array<{ name: string; score: number }> = [];

  // Add main theme categories (using standardized names)
  if (reviewThemes.beer_quality.detected && reviewThemes.beer_quality.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.beer_quality,
      score: reviewThemes.beer_quality.score,
    });
  }

  if (reviewThemes.food_menu.detected && reviewThemes.food_menu.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.food_menu,
      score: reviewThemes.food_menu.score,
    });
  }

  if (reviewThemes.service_staff.detected && reviewThemes.service_staff.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.service_staff,
      score: reviewThemes.service_staff.score,
    });
  }

  if (reviewThemes.atmosphere.detected && reviewThemes.atmosphere.score >= SCORE_THRESHOLD) {
    significantThemes.push({
      name: THEME_DISPLAY_NAMES.atmosphere,
      score: reviewThemes.atmosphere.score,
    });
  }

  // Add amenity-based themes (using standardized names)
  const amenities = reviewThemes.amenities;
  if (amenities.dog_friendly) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.dog_friendly, score: 0.5 });
  }
  if (amenities.outdoor_seating) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.outdoor_seating, score: 0.5 });
  }
  if (amenities.offers_tours) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.offers_tours, score: 0.5 });
  }
  if (amenities.beer_to_go) {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.beer_to_go, score: 0.4 });
  }
  if (amenities.food === 'In-House') {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.food_in_house, score: 0.45 });
  } else if (amenities.food === 'Food Trucks') {
    significantThemes.push({ name: THEME_DISPLAY_NAMES.food_trucks, score: 0.4 });
  }

  // Sort by score and take top 3
  significantThemes.sort((a, b) => b.score - a.score);
  const topThemes = significantThemes.slice(0, 3);

  if (topThemes.length === 0) return null;

  // Format the themes text
  const themeNames = topThemes.map(t => t.name);
  let themesText: string;

  if (themeNames.length === 1) {
    themesText = themeNames[0];
  } else if (themeNames.length === 2) {
    themesText = `${themeNames[0]} and ${themeNames[1]}`;
  } else {
    themesText = `${themeNames.slice(0, -1).join(', ')}, and ${themeNames[themeNames.length - 1]}`;
  }

  return `${breweryName} is regarded for its ${themesText}.`;
}

/**
 * Get list of all applicable theme names for a brewery
 * Returns standardized category names
 */
export function getAllApplicableThemes(reviewThemes?: ReviewThemes): string[] {
  if (!reviewThemes) return [];

  const SCORE_THRESHOLD = 0.3;
  const themes: string[] = [];

  // Main categories
  if (reviewThemes.beer_quality.detected && reviewThemes.beer_quality.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.beer_quality);
  }
  if (reviewThemes.food_menu.detected && reviewThemes.food_menu.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.food_menu);
  }
  if (reviewThemes.service_staff.detected && reviewThemes.service_staff.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.service_staff);
  }
  if (reviewThemes.atmosphere.detected && reviewThemes.atmosphere.score >= SCORE_THRESHOLD) {
    themes.push(THEME_DISPLAY_NAMES.atmosphere);
  }

  // Amenities
  const amenities = reviewThemes.amenities;
  if (amenities.dog_friendly) themes.push(THEME_DISPLAY_NAMES.dog_friendly);
  if (amenities.outdoor_seating) themes.push(THEME_DISPLAY_NAMES.outdoor_seating);
  if (amenities.offers_tours) themes.push(THEME_DISPLAY_NAMES.offers_tours);
  if (amenities.beer_to_go) themes.push(THEME_DISPLAY_NAMES.beer_to_go);
  if (amenities.has_merch) themes.push(THEME_DISPLAY_NAMES.has_merch);
  if (amenities.food === 'In-House') themes.push(THEME_DISPLAY_NAMES.food_in_house);
  if (amenities.food === 'Food Trucks') themes.push(THEME_DISPLAY_NAMES.food_trucks);
  if (amenities.other_drinks === 'yes') themes.push(THEME_DISPLAY_NAMES.other_drinks);
  if (amenities.parking === 'yes') themes.push(THEME_DISPLAY_NAMES.parking);

  return themes;
}

/**
 * Get amenity highlights from stored themes using standardized names
 */
export function getAmenityHighlights(reviewThemes?: ReviewThemes): string[] {
  if (!reviewThemes?.amenities) return [];

  const highlights: string[] = [];
  const amenities = reviewThemes.amenities;

  if (amenities.outdoor_seating) highlights.push(THEME_DISPLAY_NAMES.outdoor_seating);
  if (amenities.dog_friendly) highlights.push(THEME_DISPLAY_NAMES.dog_friendly);
  if (amenities.offers_tours) highlights.push(THEME_DISPLAY_NAMES.offers_tours);
  if (amenities.beer_to_go) highlights.push(THEME_DISPLAY_NAMES.beer_to_go);
  if (amenities.food === 'In-House') highlights.push(THEME_DISPLAY_NAMES.food_in_house);
  if (amenities.food === 'Food Trucks') highlights.push(THEME_DISPLAY_NAMES.food_trucks);
  if (amenities.other_drinks === 'yes') highlights.push(THEME_DISPLAY_NAMES.other_drinks);
  if (amenities.has_merch) highlights.push(THEME_DISPLAY_NAMES.has_merch);
  if (amenities.parking === 'yes') highlights.push(THEME_DISPLAY_NAMES.parking);

  return highlights;
}
```

### Step 4B: Update `generateAboutBreweryContent` Function

```typescript
export interface AboutContentData {
  brewery: {
    name: string;
    city: string;
    county?: string;
    type?: string | string[];
    latitude: number;
    longitude: number;
    googleRating?: number;
    googleRatingCount?: number;
    description?: string;
    reviewThemes?: ReviewThemes; // ADD THIS
  };
  beers?: Beer[];
  // Remove reviews - we now use stored themes
  yelpRating?: number;
  yelpRatingCount?: number;
}

export async function generateAboutBreweryContent(
  data: AboutContentData
): Promise<string> {
  const { brewery, beers = [] } = data;
  const parts: string[] = [];

  // Part 1: Location (unchanged)
  let locationText = `${brewery.name} is located in ${brewery.city}, Maryland`;
  const isMajor = await isMajorCity(brewery.city);
  if (!isMajor) {
    const nearest = await findNearestMajorCity(
      brewery.latitude,
      brewery.longitude,
      brewery.city
    );
    if (nearest && nearest.distance > 5) {
      locationText += `, approximately ${Math.round(nearest.distance)} miles from ${nearest.name}`;
    }
  }
  locationText += '.';
  parts.push(locationText);

  // Part 2: Type and Beer Specialization (unchanged)
  const breweryType = Array.isArray(brewery.type)
    ? brewery.type[0]
    : brewery.type || 'brewery';

  let typeText = `${brewery.name} is a ${breweryType.toLowerCase()}`;

  if (beers.length > 0) {
    const styles = extractBeerStyles(beers);
    if (styles.length >= 2) {
      const styleText = styles.slice(0, 3).join(', ');
      typeText += ` specializing in craft beers ranging from ${styleText}`;
    } else if (styles.length === 1) {
      typeText += ` known for its ${styles[0]} offerings`;
    } else {
      typeText += ' crafting a variety of beers';
    }

    const availabilitySummary = getBeerAvailabilitySummary(beers);
    if (availabilitySummary) {
      typeText += ` served ${availabilitySummary}`;
    }

    typeText += `, with ${beers.length} beer${beers.length === 1 ? '' : 's'} currently available`;
  } else {
    typeText += ' offering craft beer';
  }
  typeText += '.';
  parts.push(typeText);

  // Part 3: Ratings (unchanged)
  if (brewery.googleRatingCount && brewery.googleRatingCount > 0) {
    let ratingsText = `Patrons have rated this brewery ${brewery.googleRatingCount.toLocaleString()} times on Google`;

    if (data.yelpRatingCount && data.yelpRatingCount > 0) {
      ratingsText += ` and ${data.yelpRatingCount.toLocaleString()} times on Yelp`;
      if (brewery.googleRating && data.yelpRating) {
        const totalReviews = brewery.googleRatingCount + data.yelpRatingCount;
        const combinedAvg =
          (brewery.googleRating * brewery.googleRatingCount +
            data.yelpRating * data.yelpRatingCount) /
          totalReviews;
        ratingsText += `, with a combined average rating of ${combinedAvg.toFixed(1)} stars`;
      }
    } else if (brewery.googleRating) {
      ratingsText += `, with an average rating of ${brewery.googleRating.toFixed(1)} stars`;
    }

    ratingsText += '.';
    parts.push(ratingsText);
  }

  // Part 4: Review Themes (NEW - uses stored themes)
  const themesText = formatReviewThemesForAbout(brewery.name, brewery.reviewThemes);
  if (themesText) {
    parts.push(themesText);
  } else if (brewery.description) {
    // Fallback to existing description if no themes
    parts.push(brewery.description);
  }

  return parts.join(' ');
}
```

---

## PART 5: Update Page to Pass Review Themes

### Step 5A: Update `src/app/breweries/[slug]/page.tsx`

The brewery object already includes `reviewThemes` from the database (after updating the type conversion). No need to fetch reviews separately for theme extraction.

```typescript
// In page.tsx - simplified since themes are pre-computed

// Fetch beers for this brewery (still needed for beer styles)
const { data: beersData } = await supabase
  .from('beers')
  .select('name, style, abv, availability')
  .eq('brewery_id', brewery.id);

// Generate dynamic About content - NO LONGER NEED TO FETCH REVIEWS
const aboutContent = await generateAboutBreweryContent({
  brewery: {
    name: brewery.name,
    city: brewery.city,
    county: brewery.county,
    type: brewery.type,
    latitude: brewery.latitude,
    longitude: brewery.longitude,
    googleRating: brewery.googleRating,
    googleRatingCount: brewery.googleRatingCount,
    description: brewery.description,
    reviewThemes: brewery.reviewThemes, // Pre-computed themes from DB
  },
  beers: beersData || [],
});
```

---

## PART 6: Run the Theme Analysis

Execute in order:

```bash
# 1. Add the review_themes column (run SQL in Supabase)

# 2. Analyze all breweries and store themes
npx tsx scripts/analyze-and-store-review-themes.ts

# 3. Or analyze a single brewery
npx tsx scripts/analyze-and-store-review-themes.ts --brewery-id=abc123

# 4. Verify themes in Supabase
# Check breweries table - review_themes column should be populated
```

---

## Summary

### Database Changes
- Added `review_themes` JSONB column to `breweries` table
- Stores pre-computed theme analysis results

### New Script
- `scripts/analyze-and-store-review-themes.ts` - Analyzes reviews and stores themes

### Theme Categories Stored
| Theme | Fields |
|-------|--------|
| **Beer Quality** | detected, score, keywords, matchCount |
| **Food & Menu** | detected, score, keywords, matchCount |
| **Service & Staff** | detected, score, keywords, matchCount |
| **Atmosphere** | detected, score, keywords, matchCount |
| **Amenities** | allows_visitors, offers_tours, beer_to_go, has_merch, dog_friendly, outdoor_seating, food, other_drinks, parking |

### Benefits
1. **Faster page loads** - No need to query reviews table on each page view
2. **Consistent themes** - Same analysis applied to all breweries
3. **Updatable** - Re-run script when new reviews are fetched
4. **Queryable** - Can filter breweries by theme in Supabase
5. **Flexible** - JSONB allows adding new theme categories without schema changes

### Example Stored Data
```json
{
  "beer_quality": { "detected": true, "score": 0.85, "keywords": ["great ipas", "fresh beer"], "matchCount": 12 },
  "food_menu": { "detected": true, "score": 0.72, "keywords": ["amazing food", "great menu"], "matchCount": 8 },
  "service_staff": { "detected": true, "score": 0.90, "keywords": ["friendly staff", "great service"], "matchCount": 15 },
  "atmosphere": { "detected": true, "score": 0.65, "keywords": ["great vibe", "cozy"], "matchCount": 6 },
  "amenities": {
    "allows_visitors": true,
    "offers_tours": true,
    "beer_to_go": true,
    "has_merch": true,
    "dog_friendly": true,
    "outdoor_seating": true,
    "food": "In-House",
    "other_drinks": "yes",
    "parking": "yes"
  },
  "last_analyzed": "2025-01-01T12:00:00Z",
  "review_count_analyzed": 50
}
```

### Example Output
> "Union Craft Brewing is located in Baltimore, Maryland. Union Craft Brewing is a microbrewery specializing in craft beers ranging from IPAs, Lagers, and Stouts served including year-round favorites and rotating selections, with 12 beers currently available. Patrons have rated this brewery 847 times on Google, with an average rating of 4.6 stars. Union Craft Brewing is regarded for its service & staff, beer quality & selection, and atmosphere & ambiance."

### Additional Examples

**Brewery with amenity highlights:**
> "Falling Branch Brewery is located in Brookeville, Maryland, approximately 8 miles from Rockville. Falling Branch Brewery is a nano brewery crafting a variety of beers, with 6 beers currently available. Patrons have rated this brewery 124 times on Google, with an average rating of 4.8 stars. Falling Branch Brewery is regarded for its service & staff, dog-friendly environment, and outdoor seating."

**Brewery with food focus:**
> "RAR Brewing is located in Cambridge, Maryland. RAR Brewing is a brewpub specializing in craft beers ranging from IPAs, Sours, and Stouts served including year-round favorites and rotating selections, with 18 beers currently available. Patrons have rated this brewery 562 times on Google, with an average rating of 4.7 stars. RAR Brewing is regarded for its food & menu, beer quality & selection, and atmosphere & ambiance."

### Standardized Theme Names Reference

| Theme Key | Display Name (lowercase) |
|-----------|--------------------------|
| `beer_quality` | beer quality & selection |
| `food_menu` | food & menu |
| `service_staff` | service & staff |
| `atmosphere` | atmosphere & ambiance |
| `dog_friendly` | dog-friendly environment |
| `outdoor_seating` | outdoor seating |
| `offers_tours` | brewery tours |
| `beer_to_go` | beer to-go |
| `has_merch` | merchandise |
| `food` (In-House) | in-house kitchen |
| `food` (Food Trucks) | food trucks |
| `other_drinks` | wine & cocktails |
| `parking` | convenient parking |
