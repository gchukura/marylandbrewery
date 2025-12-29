# Fetch Google Reviews Script

This script fetches Google Reviews for all breweries in your Supabase database and stores them in the reviews table.

## Prerequisites

1. **Supabase Setup**:
   - Breweries table should have columns: `id`, `name`, `city`, `state`
   - Optional: Add `place_id` column - will be auto-populated if missing
   - Reviews table should exist (created by schema migration)

2. **Environment Variables** (in `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
   ```

3. **Google Cloud Console**:
   - Enable "Places API (Text Search)"
   - Enable "Places API (Place Details)"
   - Ensure billing is enabled

## Usage

```bash
npx tsx scripts/fetch-google-reviews.ts
```

## What It Does

1. **Reads breweries** from Supabase
2. **Checks update frequency** - Only fetches reviews for breweries that haven't been updated in the last 7 days
3. **Finds Place IDs** (if not already stored):
   - Uses Text Search API to find Place ID for each brewery
   - Stores Place ID in `place_id` column for future use
4. **Fetches reviews** using Place Details API (only for breweries that need updates)
5. **Writes reviews** to Supabase reviews table (one row per review)
6. **Updates summary** in breweries table:
   - `google_rating` - Overall rating (e.g., 4.5)
   - `google_rating_count` - Total number of reviews
   - `google_reviews_last_updated` - Timestamp of last fetch

## Weekly Update Frequency

The script automatically skips breweries that were updated within the last 7 days. This means:
- **First run**: Fetches reviews for all breweries
- **Subsequent runs**: Only fetches reviews for breweries that haven't been updated in the past week

## Output

The script provides detailed logging:
- Progress for each brewery
- Place ID lookup results
- Number of reviews fetched
- Summary statistics

## Troubleshooting

### "API keys with referer restrictions cannot be used with this API"

Your Google Maps API key has HTTP referer restrictions, which don't work for server-side scripts.

**Solution:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create a NEW API key for server-side use
3. Set "Application restrictions" to "None"
4. Set "API restrictions" to only: Places API (Text Search) and Places API (Place Details)
5. Add it to `.env.local` as: `GOOGLE_MAPS_API_KEY=your_new_key`

See `TROUBLESHOOTING_API_KEY_RESTRICTIONS.md` for detailed instructions.

### "Could not find Place ID"

The brewery might not be listed on Google Maps under the exact name/city combination. The script tries multiple search strategies:
1. Original query with "brewery" keyword
2. Query without "brewery" keyword
3. Query with full street address

### "No reviews found"

- Place might not have reviews yet
- Place might not exist on Google Maps
- Check the Place ID manually in Google Maps

### Reviews not appearing

- Check Supabase reviews table
- Verify the brewery_id matches
- Check for any errors in the script output

## Notes

- Reviews are appended to the reviews table (not replaced)
- To avoid duplicates, the script checks for recent updates before fetching
- Place IDs are stored for efficiency (saves ~50% on API costs on subsequent runs)
