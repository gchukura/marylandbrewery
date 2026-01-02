# Scrape Maryland Neighborhoods Script

This script scrapes all 707 neighborhoods from homes.com's Maryland neighborhood search page and stores them in the Supabase `maryland_neighborhoods` table.

## Overview

The script:
1. Uses Playwright to handle JavaScript-rendered content
2. Navigates through paginated results
3. Extracts neighborhood name, description, city, county, and URL
4. Stores data in Supabase with deduplication by slug

## Prerequisites

1. **Environment Variables** (in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for write access)

2. **Required Packages**:
   ```bash
   npm install playwright
   npx playwright install chromium
   ```

3. **Database**:
   - The `maryland_neighborhoods` table must exist (run the migration first):
     ```bash
     npx supabase db push
     ```
     Or manually run: `supabase/migrations/20251231221049_create_neighborhoods_table.sql`

## Usage

### Basic Usage

```bash
# Dry run (preview what would be scraped without writing to database)
npx tsx scripts/scrape-maryland-neighborhoods.ts --dry-run

# Full run (scrape and store all neighborhoods)
npx tsx scripts/scrape-maryland-neighborhoods.ts
```

## How It Works

1. **Page Navigation**:
   - Starts at the first page of results
   - Automatically detects and clicks "Next" buttons
   - Stops when no more pages are found or after 3 consecutive empty pages

2. **Data Extraction**:
   - Tries multiple CSS selectors to find neighborhood cards
   - Extracts name, description, city, county, and URL
   - Handles various HTML structures and layouts

3. **Deduplication**:
   - Uses `slug` (URL-friendly version of name) to prevent duplicates
   - If a neighborhood with the same slug exists, it updates the existing record

4. **Error Handling**:
   - Continues scraping even if individual neighborhoods fail to extract
   - Logs warnings for debugging
   - Stops gracefully if pagination fails

## Data Stored

For each neighborhood, the script stores:

- **Basic Info**: name, slug, description
- **Location**: city, county, state (MD)
- **Links**: url, homes_url (link to homes.com page)
- **Metadata**: created_at, updated_at

## Output

The script provides detailed console output:

```
🏘️  Maryland Neighborhoods Scraper
================================
Mode: LIVE
Target: https://www.homes.com/neighborhood-search/maryland/

📄 Scraping page 1...
  ✓ Found 25 neighborhoods using selector: .neighborhood-card
  ✓ Extracted 25 neighborhoods from page 1

📄 Scraping page 2...
  ✓ Found 25 neighborhoods using selector: .neighborhood-card
  ✓ Extracted 25 neighborhoods from page 2

📊 Summary:
  Total pages scraped: 29
  Total neighborhoods found: 707
  Unique neighborhoods: 707

💾 Saving to database...
✅ Complete!
  Saved: 707
  Failed: 0
  Total unique: 707
```

## Troubleshooting

### "No neighborhood cards found"

**Problem**: The website structure may have changed, or selectors need updating.

**Solution**:
1. Visit the website manually and inspect the HTML structure
2. Update the `cardSelectors` array in the script with the correct selectors
3. Check browser console for any JavaScript errors

### "Could not navigate to next page"

**Problem**: Pagination structure may have changed.

**Solution**:
1. Check the pagination HTML structure on the website
2. Update the `nextSelectors` array in the script
3. Try running with `--dry-run` first to see what's being detected

### Playwright Installation Issues

**Problem**: `playwright` not found or browser not installed.

**Solution**:
```bash
npm install playwright
npx playwright install chromium
```

### Rate Limiting / Blocking

**Problem**: Website may block requests if too frequent.

**Solution**:
- The script includes delays between requests
- If blocked, increase the `sleep()` delays in the script
- Consider running during off-peak hours

## Notes

- The script respects rate limits with built-in delays
- It handles various HTML structures and will try multiple selectors
- Neighborhoods are deduplicated by slug (URL-friendly name)
- The script stops automatically when no more pages are found
- All data is stored in Supabase for easy querying and integration

## Expected Results

- **Total neighborhoods**: ~707 (as mentioned on the website)
- **Pages**: ~29 pages (assuming ~25 neighborhoods per page)
- **Scraping time**: ~5-10 minutes depending on network speed
- **Storage**: Minimal database space (~50-100 KB for all neighborhoods)

