/**
 * Enrich Amenities from Google Reviews Script
 *
 * This script:
 * 1. Reads Google reviews from the `reviews` table
 * 2. Uses keyword heuristics on review_text to infer amenities:
 *    - allows_visitors
 *    - offers_tours
 *    - food (text; "In-House", "Food Trucks", or NULL)
 *    - other_drinks (text; "yes" or "no" - lowercase)
 *    - beer_to_go
 *    - has_merch
 *    - parking (text; "yes" or "no" - lowercase)
 *    - dog_friendly
 *    - outdoor_seating
 * 3. Updates the `breweries` table in Supabase, appending to / filling
 *    missing fields WITHOUT overwriting existing truthy values.
 *
 * Usage:
 *   npx tsx scripts/enrich-amenities-from-reviews.ts
 *
 * Env required in `.env.local`:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve as resolvePath } from 'path';
config({ path: resolvePath(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required. Please set it in .env.local'
  );
}

const adminClient = supabaseAdmin;
if (!adminClient) {
  throw new Error(
    'Failed to initialize Supabase admin client. Check your SUPABASE_SERVICE_ROLE_KEY.'
  );
}

const client = adminClient as NonNullable<typeof adminClient>;

type ReviewRow = {
  review_text: string | null;
};

type BreweryRow = {
  id: string;
  name: string;
  allows_visitors: boolean | null;
  offers_tours: boolean | null;
  beer_to_go: boolean | null;
  has_merch: boolean | null;
  food: string | null;
  other_drinks: string | null;
  parking: string | null;
  dog_friendly: boolean | null;
  outdoor_seating: boolean | null;
};

function normalizeText(text: string | null | undefined): string {
  return (text || '').toLowerCase();
}

function includesAny(text: string, patterns: RegExp[]): boolean {
  if (!text) return false;
  return patterns.some((re) => re.test(text));
}

/**
 * Infer amenities from combined review text
 */
function inferAmenitiesFromReviews(text: string) {
  const t = normalizeText(text);

  // Allows visitors: any reviews at all implies visitors.
  const inferredAllowsVisitors = t.trim().length > 0;

  const tourPatterns = [
    /\bbrewery tour\b/,
    /\bbrewery tours\b/,
    /\bbrew tour\b/,
    /\bbrewhouse tour\b/,
    /\btour of the brewery\b/,
    /\btour(s)?\b/,
  ];

  const foodTruckPatterns = [
    /\bfood truck(s)?\b/,
    /\bfood-truck(s)?\b/,
  ];

  const kitchenFoodPatterns = [
    /\bfull kitchen\b/,
    /\bkitchen\b/,
    /\bmenu\b/,
    /\bdinner\b/,
    /\blunch\b/,
    /\bappetizer(s)?\b/,
    /\bapp(s)?\b/,
    /\bentree(s)?\b/,
    /\bfood\b/,
    /\bpizza\b/,
    /\bburger(s)?\b/,
    /\bwings\b/,
    /\btacos\b/,
    /\bnachos\b/,
    /\bpretzel(s)?\b/,
  ];

  const otherDrinksPatterns = [
    /\bwine(s)?\b/,
    /\bcocktail(s)?\b/,
    /\bmixed drink(s)?\b/,
    /\bfull bar\b/,
    /\bspirits\b/,
    /\bliquor\b/,
    /\bwhiskey\b/,
    /\bvodka\b/,
    /\bgin\b/,
    /\bcider(s)?\b/,
    /\bseltzer(s)?\b/,
    /\bhard seltzer(s)?\b/,
    /\bmead\b/,
  ];

  const beerToGoPatterns = [
    /\bgrowler(s)?\b/,
    /\bcrowler(s)?\b/,
    /\bcan(s)? to go\b/,
    /\bbeer to go\b/,
    /\bto[- ]go beer\b/,
    /\btake (some )?home\b/,
    /\b4[- ]pack\b/,
    /\bsix[- ]pack\b/,
    /\bcase(s)?\b/,
    /\bto[- ]go\b/,
  ];

  const merchPatterns = [
    /\bmerch\b/,
    /\bmerchandise\b/,
    /\bswag\b/,
    /\bt[- ]?shirt(s)?\b/,
    /\bhoodie(s)?\b/,
    /\bhat(s)?\b/,
    /\bcap(s)?\b/,
    /\bglassware\b/,
    /\bpint glass(es)?\b/,
  ];

  const parkingPatterns = [
    /\bparking\b/,
    /\bparking lot\b/,
    /\bstreet parking\b/,
    /\bplenty of parking\b/,
    /\beasy parking\b/,
    /\bgarage parking\b/,
  ];

  const dogFriendlyPatterns = [
    /\bdog[- ]friendly\b/,
    /\bpet[- ]friendly\b/,
    /\bdogs? allowed\b/,
    /\bbring (your )?dog\b/,
    /\bpup(s)?\b/,
    /\bdogs? on leash\b/,
  ];

  const outdoorSeatingPatterns = [
    /\boutdoor seating\b/,
    /\boutside seating\b/,
    /\bpatio\b/,
    /\bbeer garden\b/,
    /\bbeer-garden\b/,
    /\brooftop\b/,
    /\bpicnic table(s)?\b/,
    /\bdeck\b/,
  ];

  const offersTours = includesAny(t, tourPatterns);
  const beerToGo = includesAny(t, beerToGoPatterns);
  const hasMerch = includesAny(t, merchPatterns);
  const dogFriendly = includesAny(t, dogFriendlyPatterns);
  const outdoorSeating = includesAny(t, outdoorSeatingPatterns);

  const hasFoodTruck = includesAny(t, foodTruckPatterns);
  const hasKitchenFood = includesAny(t, kitchenFoodPatterns);

  const otherDrinks = includesAny(t, otherDrinksPatterns);
  const parking = includesAny(t, parkingPatterns);

  // Food taxonomy: "In-House", "Food Trucks", or NULL
  // If both are detected, prefer "In-House" (more comprehensive)
  let inferredFood: string | null = null;
  if (hasKitchenFood) {
    inferredFood = 'In-House';
  } else if (hasFoodTruck) {
    inferredFood = 'Food Trucks';
  }
  
  // other_drinks: "yes" or "no" (lowercase)
  const inferredOtherDrinks = otherDrinks ? 'yes' : null;
  
  // parking: "yes" or "no" (lowercase)
  const inferredParking = parking ? 'yes' : null;

  return {
    allows_visitors: inferredAllowsVisitors,
    offers_tours: offersTours,
    beer_to_go: beerToGo,
    has_merch: hasMerch,
    food: inferredFood,
    other_drinks: inferredOtherDrinks,
    parking: inferredParking,
    dog_friendly: dogFriendly,
    outdoor_seating: outdoorSeating,
  };
}

async function enrichAmenitiesFromReviews() {
  console.log('🚀 Starting amenities enrichment from Google reviews...\n');

  try {
    // Step 1: Fetch all breweries
    console.log('📥 Step 1: Fetching breweries from Supabase...');
    const { data: breweries, error: breweriesError } = await client
      .from('breweries')
      .select(
        'id, name, allows_visitors, offers_tours, beer_to_go, has_merch, food, other_drinks, parking, dog_friendly, outdoor_seating'
      )
      .order('name');

    if (breweriesError) {
      throw new Error(`Failed to fetch breweries: ${breweriesError.message}`);
    }

    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }

    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;

    const fieldUpdateCounts: Record<string, number> = {
      allows_visitors: 0,
      offers_tours: 0,
      beer_to_go: 0,
      has_merch: 0,
      food: 0,
      other_drinks: 0,
      parking: 0,
      dog_friendly: 0,
      outdoor_seating: 0,
    };

    // Step 2: For each brewery, fetch reviews and infer amenities
    for (const brewery of breweries as BreweryRow[]) {
      processed++;
      console.log(`[${processed}/${breweries.length}] ${brewery.name}`);

      try {
        // Fetch reviews for this brewery
        const { data: reviews, error: reviewsError } = await client
          .from('reviews')
          .select('review_text, language')
          .eq('brewery_id', brewery.id)
          .eq('language', 'en');

        if (reviewsError) {
          console.error(
            `   ✗ Error fetching reviews: ${reviewsError.message}`
          );
          errorCount++;
          console.log('');
          continue;
        }

        if (!reviews || reviews.length === 0) {
          console.log('   ⊘ No reviews found; skipping');
          skipped++;
          console.log('');
          continue;
        }

        const combinedText = reviews
          .map((r: any) => r.review_text || '')
          .join(' ');

        const inferred = inferAmenitiesFromReviews(combinedText);

        const updates: Partial<BreweryRow> = {};

        // Only set fields that are currently falsy/empty and inferred as truthy
        if (!brewery.allows_visitors && inferred.allows_visitors) {
          updates.allows_visitors = true;
          fieldUpdateCounts.allows_visitors++;
        }

        if (!brewery.offers_tours && inferred.offers_tours) {
          updates.offers_tours = true;
          fieldUpdateCounts.offers_tours++;
        }

        if (!brewery.beer_to_go && inferred.beer_to_go) {
          updates.beer_to_go = true;
          fieldUpdateCounts.beer_to_go++;
        }

        if (!brewery.has_merch && inferred.has_merch) {
          updates.has_merch = true;
          fieldUpdateCounts.has_merch++;
        }

        if (!brewery.dog_friendly && inferred.dog_friendly) {
          updates.dog_friendly = true;
          fieldUpdateCounts.dog_friendly++;
        }

        if (!brewery.outdoor_seating && inferred.outdoor_seating) {
          updates.outdoor_seating = true;
          fieldUpdateCounts.outdoor_seating++;
        }

        if (!brewery.food && inferred.food) {
          updates.food = inferred.food;
          fieldUpdateCounts.food++;
        }

        if (!brewery.other_drinks && inferred.other_drinks) {
          updates.other_drinks = inferred.other_drinks;
          fieldUpdateCounts.other_drinks++;
        }

        if (!brewery.parking && inferred.parking) {
          updates.parking = inferred.parking;
          fieldUpdateCounts.parking++;
        }

        if (Object.keys(updates).length === 0) {
          skipped++;
          console.log('   ⊘ No new amenities inferred or fields already set');
          console.log('');
          continue;
        }

        const { error: updateError } = await client
          .from('breweries')
          .update(updates)
          .eq('id', brewery.id);

        if (updateError) {
          console.error(`   ✗ Error updating brewery: ${updateError.message}`);
          errorCount++;
        } else {
          updated++;
          console.log(
            `   ✅ Updated amenities: ${Object.keys(updates).join(', ')}`
          );
        }
      } catch (error) {
        console.error(
          `   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        errorCount++;
      }

      console.log(''); // Empty line for readability
    }

    console.log('\n📊 Amenities Enrichment Summary (from Google reviews):');
    console.log(`   - Breweries processed: ${processed}`);
    console.log(`   - Breweries updated: ${updated}`);
    console.log(`   - Breweries skipped (no changes): ${skipped}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log('   - Fields updated:');
    Object.entries(fieldUpdateCounts).forEach(([field, count]) => {
      console.log(`       • ${field}: ${count}`);
    });

    console.log(
      '\n🎉 Amenities enrichment from reviews completed successfully!'
    );
  } catch (error) {
    console.error('\n❌ Amenities enrichment failed:', error);
    process.exit(1);
  }
}

// Run enrichment
enrichAmenitiesFromReviews().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


