# Google Reviews Integration Proposal

## Overview
This document outlines options for pulling Google Reviews into your Google Sheets brewery directory. Based on your existing codebase, you already have:
- ✅ Google Sheets API integration (`lib/google-sheets.ts`)
- ✅ Google Places API usage (in `scripts/enrich-breweries.ts`)
- ✅ Service account authentication setup
- ✅ Place ID lookup functionality

## Google Places API Reviews Structure

The Google Places API (Place Details) returns reviews in this format:
```json
{
  "reviews": [
    {
      "author_name": "John Doe",
      "author_url": "https://www.google.com/maps/contrib/...",
      "language": "en",
      "profile_photo_url": "https://...",
      "rating": 5,
      "relative_time_description": "2 months ago",
      "text": "Great brewery with excellent beer selection!",
      "time": 1234567890
    }
  ],
  "rating": 4.5,
  "user_ratings_total": 127
}
```

## Option 1: Node.js/TypeScript Script (Recommended)

**Best for:** Automated, scheduled updates with full control and error handling

### Implementation Approach
Create a script similar to `scripts/enrich-breweries.ts` that:
1. Reads brewery data from Google Sheets
2. Finds/uses Place IDs for each brewery
3. Fetches reviews via Place Details API
4. Writes reviews back to Google Sheets

### Pros
- ✅ Consistent with your existing codebase architecture
- ✅ Full TypeScript type safety
- ✅ Can be run locally or via CI/CD
- ✅ Easy to add error handling, retries, rate limiting
- ✅ Can store Place IDs in Google Sheets for efficiency
- ✅ Can batch updates to Google Sheets

### Cons
- ❌ Requires Node.js environment to run
- ❌ Not as "native" to Google Sheets as Apps Script

### Implementation Details

#### Step 1: Add Review Columns to Google Sheet
Add these columns to your brewery sheet (after column `AK`):
- `AL`: `place_id` - Store Google Place ID for efficiency (saves ~50% on API costs)
- `AM`: `google_rating` - Overall rating (e.g., 4.5)
- `AN`: `google_rating_count` - Total number of reviews
- `AO`: `google_reviews_last_updated` - Timestamp of last review fetch
- `AP`: `google_reviews_json` - Full reviews JSON (optional, for detailed analysis)

Or create a separate "Reviews" sheet with columns:
- `brewery_id` | `reviewer_name` | `rating` | `review_text` | `review_date` | `review_time` | `profile_url`

#### Step 2: Create the Script
File: `scripts/fetch-google-reviews.ts`

Key features:
- Stores Place IDs in `place_id` column for efficiency (avoids repeated Text Search API calls)
- Reuses Place ID lookup from `enrich-breweries.ts` (finds Place ID using name + address on first run)
- Fetches reviews using Place Details API with `reviews` field
- Writes to Google Sheets using existing `google-sheets.ts` patterns
- Rate limiting (40 req/sec to match your existing scripts)
- Error handling and retries

#### Step 3: Schedule Execution
- Run manually: `npx tsx scripts/fetch-google-reviews.ts`
- Schedule via cron (local/server)
- Trigger via API endpoint (similar to `/api/sync`)
- GitHub Actions scheduled workflow

### Cost Considerations
- **Place Details API**: $17 per 1,000 requests (with reviews field)
- **Text Search API**: $32 per 1,000 requests (only needed once to find Place ID)
- **Google Sheets API**: Free (within quotas)

For 100 breweries:
- **Initial run** (with Text Search to find Place IDs): ~$3.20 (100 × $0.032) + ~$1.70 (100 × $0.017) = ~$4.90
- **Subsequent runs** (using stored Place IDs): ~$1.70 per run (100 × $0.017)
- Daily updates: ~$51/month
- Weekly updates: ~$7/month
- Monthly updates: ~$1.70/month

**Note:** Storing Place IDs saves ~50% on API costs for subsequent runs!

---

## Option 2: Google Apps Script

**Best for:** Native Google Sheets integration, easy scheduling, no external dependencies

### Implementation Approach
Create a Google Apps Script that:
1. Reads brewery data from the current sheet
2. Uses Google Places API (via UrlFetchApp)
3. Writes reviews back to the sheet or a separate "Reviews" sheet

### Pros
- ✅ Runs directly in Google Sheets
- ✅ Easy to schedule with built-in triggers
- ✅ No external dependencies
- ✅ Can be shared with non-technical users
- ✅ Free to run (within quotas)

### Cons
- ❌ JavaScript only (no TypeScript)
- ❌ Less sophisticated error handling
- ❌ Harder to test locally
- ❌ Limited debugging tools
- ❌ 6-minute execution time limit

### Implementation Details

#### Step 1: Create Apps Script
1. Open your Google Sheet
2. Go to `Extensions` → `Apps Script`
3. Create script to fetch reviews

#### Step 2: Set Up OAuth/API Key
- Store Google Maps API key in Script Properties
- Or use OAuth2 for service account (more complex)

#### Step 3: Schedule Trigger
- `Edit` → `Current project's triggers`
- Set to run daily/weekly

### Code Structure (Apps Script)
```javascript
function fetchGoogleReviews() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const nameCol = headers.indexOf('name');
  const cityCol = headers.indexOf('city');
  const placeIdCol = headers.indexOf('place_id');
  const ratingCol = headers.indexOf('google_rating');
  
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
  
  // Process each brewery row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // ... fetch reviews and update row
  }
}
```

---

## Option 3: Hybrid Approach (Recommended for Production)

**Best for:** Best of both worlds - efficiency and flexibility

### Implementation Strategy
1. **Initial Setup (Node.js Script)**:
   - Run once to find and store Place IDs for all breweries
   - Populate `place_id` column in Google Sheets
   - Fetches reviews and stores them

2. **Regular Updates (Choose one)**:
   - **Option A**: Node.js script (scheduled) - Full control, better error handling
   - **Option B**: Apps Script (scheduled) - Native, easy to maintain
   - **Option C**: Both - Apps Script for daily updates, Node.js for comprehensive refreshes

3. **Review Storage**:
   - **Summary columns** in main sheet: `place_id`, `google_rating`, `google_rating_count`, `google_reviews_last_updated`
   - **Detailed reviews** in separate "Reviews" sheet: One row per review, linked via `brewery_id` (uses existing `id` column)

### Benefits
- ✅ Place IDs stored = 50% cost savings on subsequent runs
- ✅ Flexibility to use either approach
- ✅ Detailed reviews in separate sheet for analysis
- ✅ Summary metrics in main sheet for quick reference

---

## Option 4: Separate Reviews Sheet (Recommended Structure)

### Sheet Structure: "Reviews"

| Column | Description |
|--------|-------------|
| `brewery_id` | Links to main sheet `id` column |
| `brewery_name` | For easy reference |
| `reviewer_name` | Reviewer's display name |
| `rating` | 1-5 star rating |
| `review_text` | Full review text |
| `review_date` | Formatted date (e.g., "2 months ago") |
| `review_timestamp` | Unix timestamp for sorting |
| `reviewer_url` | Link to reviewer's profile |
| `profile_photo_url` | Reviewer's profile photo |
| `language` | Review language code |
| `fetched_at` | When this review was fetched |

### Benefits
- ✅ One row per review = easy filtering, sorting, analysis
- ✅ Can track review history over time
- ✅ Can identify new reviews on subsequent runs
- ✅ Can calculate trends (rating changes, review volume)

---

## Recommended Implementation Plan

### Phase 1: Setup (Node.js Script)
1. ✅ Create `scripts/fetch-google-reviews.ts`
2. ✅ Add Place ID lookup/storage functionality (reuse from `enrich-breweries.ts`)
3. ✅ Add review fetching with Place Details API
4. ✅ Create "Reviews" sheet structure (uses existing `id` column for linking)
5. ✅ Write reviews to Google Sheets
6. ✅ Store Place IDs in `place_id` column for efficiency

### Phase 2: Initial Population
1. Run script to find Place IDs for all breweries
2. Store Place IDs in main sheet (`place_id` column)
3. Fetch all reviews and populate "Reviews" sheet (linked via `brewery_id` = `id` column)
4. Update summary columns in main sheet

### Phase 3: Automation
1. Set up scheduled execution (cron, GitHub Actions, or Apps Script)
2. Add logic to only fetch new/updated reviews
3. Monitor API usage and costs

### Phase 4: Enhancement (Optional)
1. Add review analysis (sentiment, keywords)
2. Create dashboard/charts from review data
3. Set up alerts for negative reviews
4. Track review trends over time

---

## API Considerations

### Required Google Cloud APIs
- ✅ **Places API** (already enabled based on your scripts)
- ✅ **Places API (New)** - If using new Places API
- ✅ **Google Sheets API** (already enabled)

### Rate Limits
- **Place Details API**: 50,000 requests/day (free tier)
- **Text Search API**: Same limits
- **Google Sheets API**: 300 requests/100 seconds/user

### Cost Optimization
1. **Store Place IDs**: Reduces API calls by ~50% on subsequent runs
2. **Batch Updates**: Update Google Sheets in batches
3. **Incremental Updates**: Only fetch reviews for breweries that need updates (check `google_reviews_last_updated`)
4. **Cache Reviews**: Store review timestamps to avoid re-fetching unchanged reviews
5. **Schedule Wisely**: Weekly or monthly updates instead of daily to reduce costs

---

## Code Structure Preview

### New File: `scripts/fetch-google-reviews.ts`

```typescript
/**
 * Fetch Google Reviews Script
 * 
 * 1. Reads breweries from Google Sheets
 * 2. Finds/stores Place IDs
 * 3. Fetches reviews via Place Details API
 * 4. Writes reviews to "Reviews" sheet
 * 5. Updates summary columns in main sheet
 */

// Similar structure to enrich-breweries.ts
// - Uses existing Google Sheets integration
// - Uses existing Place ID lookup
// - Adds review fetching and writing
```

### New Functions in `lib/google-sheets.ts`

```typescript
/**
 * Write reviews to Google Sheets Reviews sheet
 * Uses brewery.id to link reviews to breweries
 */
export async function writeReviewsToSheets(
  breweryId: string,
  reviews: GoogleReview[]
): Promise<void>

/**
 * Update review summary in main sheet
 * Finds brewery by id column and updates summary columns
 */
export async function updateReviewSummary(
  breweryId: string,
  rating: number,
  ratingCount: number
): Promise<void>

/**
 * Store Place ID for a brewery
 * Updates place_id column in main sheet
 */
export async function storePlaceId(
  breweryId: string,
  placeId: string
): Promise<void>
```

---

## Next Steps

1. **Decide on approach**: Node.js script, Apps Script, or hybrid?
2. **Choose storage**: Summary columns only, or separate Reviews sheet?
3. **Set up Place ID storage**: Add `place_id` column to main sheet
4. **Implement script**: Create the review fetching script
5. **Test with small subset**: Test with 5-10 breweries first
6. **Schedule execution**: Set up automated runs
7. **Monitor costs**: Track API usage in Google Cloud Console

---

## Questions to Consider

1. **How often do you want to update reviews?**
   - Daily? Weekly? Monthly?
   - This affects API costs and scheduling approach

2. **Do you need full review history or just current reviews?**
   - Full history = separate Reviews sheet
   - Current only = summary columns sufficient

3. **Do you want to analyze reviews (sentiment, keywords)?**
   - If yes, separate sheet + analysis script recommended

4. **What's your budget for API costs?**
   - ~$50/month for daily updates of 100 breweries
   - Can reduce with weekly/monthly updates

5. **Who will maintain this?**
   - Technical team → Node.js script
   - Non-technical → Apps Script might be easier

---

## Recommendation

**I recommend Option 3 (Hybrid) with Option 4 (Separate Reviews Sheet):**

1. **Start with Node.js script** (`scripts/fetch-google-reviews.ts`)
   - Consistent with your codebase
   - Full control and error handling
   - Easy to test and debug

2. **Store Place IDs** in `place_id` column for efficiency
   - Saves ~50% on API costs for subsequent runs
   - Only need Text Search API on initial run

3. **Use separate "Reviews" sheet** for detailed review data
   - One row per review
   - Linked to breweries via `brewery_id` = `id` column

4. **Update summary columns** in main sheet (rating, count, last updated)

5. **Schedule via GitHub Actions** or similar (daily/weekly)

This gives you:
- ✅ Cost efficiency (stored Place IDs reduce API costs by ~50%)
- ✅ Detailed review data for analysis
- ✅ Summary metrics for quick reference
- ✅ Consistent with existing codebase patterns
- ✅ Easy to maintain and extend

Would you like me to implement the Node.js script following this approach?

