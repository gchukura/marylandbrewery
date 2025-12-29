/**
 * Enrich Brewers Association of Maryland (MBAM) Memberships Script
 *
 * This script:
 * 1. Scrapes the Maryland Beer website current members page:
 *    https://marylandbeer.org/brewing-companies/current-members/
 * 2. Extracts brewery names for current members
 * 3. Matches those breweries against the Supabase `breweries` table
 * 4. Updates the `memberships` JSONB column to include a
 *    "Brewers Association of Maryland" membership entry
 *
 * Usage:
 *   npx tsx scripts/enrich-mbam-memberships.ts
 *
 * Env required in `.env.local`:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin, DatabaseBrewery } from '../lib/supabase';

const MARYLAND_BEER_MEMBERS_URL =
  'https://marylandbeer.org/brewing-companies/current-members/';

const MBAM_MEMBERSHIP_NAME = 'brewers_association_of_maryland';

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

/**
 * Normalize brewery name for matching
 * (reuse logic similar to fetch-brewery-logos.ts)
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch and parse the Maryland Beer current members page
 * Returns a set of normalized member names.
 */
async function fetchMarylandBeerMembers(): Promise<Set<string>> {
  console.log(
    '📥 Fetching Maryland Beer current members page for MBAM memberships...'
  );

  const response = await fetch(MARYLAND_BEER_MEMBERS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MarylandBreweryBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: HTTP ${response.status}`);
  }

  const html = await response.text();
  const memberNames = new Set<string>();

  // 1) Extract brewery names from image alt attributes (logos)
  //    <img alt="Brewery Name" ...>
  const imgAltRegex = /<img[^>]+alt=["']([^"']+)["'][^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgAltRegex.exec(html)) !== null) {
    const rawName = imgMatch[1].trim();
    if (!rawName || rawName.length < 3) continue;
    const normalized = normalizeName(rawName);
    memberNames.add(normalized);
  }

  // 2) Extract brewery names from headings within the page
  //    <h2>brewery name</h2>, <h3>brewery name</h3>, etc.
  const headingRegex = /<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi;
  let headingMatch: RegExpExecArray | null;
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    const rawName = headingMatch[1].trim();
    if (!rawName || rawName.length < 3) continue;

    const lower = rawName.toLowerCase();
    // Skip generic headings
    if (
      lower.includes('current member') ||
      lower.includes('current members') ||
      lower.includes('our breweries') ||
      lower.includes('maryland beer')
    ) {
      continue;
    }

    const normalized = normalizeName(rawName);
    memberNames.add(normalized);
  }

  console.log(`   ✓ Found ${memberNames.size} potential MBAM member names\n`);
  return memberNames;
}

/**
 * Determine if a Supabase brewery should be treated as an MBAM member
 * based on normalized name matching and suffix-insensitive comparison.
 */
function isMemberOfMBAM(
  brewery: Pick<DatabaseBrewery, 'name'>,
  memberNames: Set<string>
): boolean {
  const normalizedName = normalizeName(brewery.name);

  if (!normalizedName) return false;

  // Exact normalized match
  if (memberNames.has(normalizedName)) {
    return true;
  }

  // Try matching without common suffixes (brewing, brewery, etc.)
  const stripSuffix = (name: string) =>
    name.replace(
      /\s+(brewing|brewery|brewing company|brewing co|brewing co\.|breweries|beer company|beer co|beer co\.)$/i,
      ''
    );

  const baseName = stripSuffix(normalizedName);

  for (const member of memberNames) {
    const memberBase = stripSuffix(member);

    if (
      baseName === memberBase ||
      baseName.includes(memberBase) ||
      memberBase.includes(baseName)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Update memberships array to include MBAM membership
 */
function updateMembershipsWithMBAM(
  currentMemberships:
    | Array<{
        name: string;
        description?: string; // kept in type for compatibility, but not set here
        benefits?: string[]; // kept in type for compatibility, but not set here
        price?: number;
        duration?: string;
      }>
    | null
    | undefined
) {
  const existing = (currentMemberships || []).filter((m) => {
    const n = m.name.toLowerCase();
    return !(
      n.includes('brewers_association_of_maryland') ||
      n.includes('brewers association of maryland') ||
      n.includes('maryland brewers association')
    );
  });

  // Only store the canonical membership key; no description/benefits
  existing.push({
    name: MBAM_MEMBERSHIP_NAME,
  });

  return existing;
}

/**
 * Main enrichment function
 */
async function enrichMBAMMemberships() {
  console.log('🚀 Starting Brewers Association of Maryland membership enrichment...\n');

  try {
    // Step 1: Scrape Maryland Beer current members page
    console.log('📥 Step 1: Scraping Maryland Beer current members list...');
    const memberNames = await fetchMarylandBeerMembers();
    console.log(
      `   ✓ Scraped ${memberNames.size} normalized member names from MarylandBeer.org\n`
    );

    // Step 2: Fetch all breweries from Supabase
    console.log('📥 Step 2: Fetching breweries from Supabase...');
    const { data: breweries, error: fetchError } = await client
      .from('breweries')
      .select('id, name, memberships')
      .order('name');

    if (fetchError) {
      throw new Error(`Failed to fetch breweries: ${fetchError.message}`);
    }

    if (!breweries || breweries.length === 0) {
      console.log('   ℹ️  No breweries found in Supabase');
      return;
    }

    console.log(`   ✓ Fetched ${breweries.length} breweries\n`);

    // Step 3: Match and update memberships
    console.log(
      '🔍 Step 3: Matching breweries to MarylandBeer.org members and updating memberships...\n'
    );

    let processed = 0;
    let matched = 0;
    let updated = 0;
    let alreadyHadMembership = 0;
    let notMatched = 0;
    let errorCount = 0;

    for (const brewery of breweries as DatabaseBrewery[]) {
      processed++;
      console.log(`[${processed}/${breweries.length}] ${brewery.name}`);

      try {
        const isMember = isMemberOfMBAM(brewery, memberNames);

        if (!isMember) {
          notMatched++;
          console.log('   ⊘ Not found in MarylandBeer.org current members list');
          console.log('');
          continue;
        }

        matched++;

        const currentMemberships = (brewery.memberships as any[]) || [];

        const alreadyHas = currentMemberships.some((m) => {
          const n = (m.name || '').toLowerCase();
          return (
            n.includes('brewers_association_of_maryland') ||
            n.includes('brewers association of maryland') ||
            n.includes('maryland brewers association')
          );
        });

        if (alreadyHas) {
          alreadyHadMembership++;
          console.log(
            '   ⊘ Already has brewers_association_of_maryland membership, skipping update'
          );
          console.log('');
          continue;
        }

        const updatedMemberships = updateMembershipsWithMBAM(
          currentMemberships
        );

        const { error } = await client
          .from('breweries')
          .update({ memberships: updatedMemberships })
          .eq('id', brewery.id);

        if (error) {
          console.error(`   ✗ Error updating memberships: ${error.message}`);
          errorCount++;
        } else {
          updated++;
          console.log(
            `   ✅ Added "${MBAM_MEMBERSHIP_NAME}" to memberships for this brewery`
          );
        }
      } catch (error) {
        console.error(
          `   ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        errorCount++;
      }

      console.log(''); // blank line for readability
    }

    console.log('\n📊 MBAM Enrichment Summary:');
    console.log(`   - Breweries processed: ${processed}`);
    console.log(`   - Member names scraped from MarylandBeer.org: ${memberNames.size}`);
    console.log(`   - Breweries matched as MBAM members: ${matched}`);
    console.log(`   - Memberships added: ${updated}`);
    console.log(`   - Already had MBAM membership: ${alreadyHadMembership}`);
    console.log(`   - Not matched: ${notMatched}`);
    console.log(`   - Errors: ${errorCount}\n`);

    console.log(
      '🎉 Brewers Association of Maryland membership enrichment completed successfully!'
    );
  } catch (error) {
    console.error('\n❌ MBAM enrichment failed:', error);
    process.exit(1);
  }
}

// Run enrichment
enrichMBAMMemberships().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


