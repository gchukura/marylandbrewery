# Fetch Google Reviews Script

This script fetches Google Reviews for all breweries in your Google Sheets and stores them in a separate "Reviews" sheet.

## Prerequisites

1. **Google Sheets Setup**:
   - Main brewery sheet should have columns: `id`, `name`, `city`, `state`
   - Optional: Add `place_id` column (AL) - will be auto-populated if missing
   - Optional: Add summary columns: `google_rating` (AM), `google_rating_count` (AN), `google_reviews_last_updated` (AO)
   - Create a "Reviews" sheet with these columns (in order):
     - `brewery_id`
     - `brewery_name`
     - `reviewer_name`
     - `rating`
     - `review_text`
     - `review_date`
     - `review_timestamp`
     - `reviewer_url`
     - `profile_photo_url`
     - `language`
     - `fetched_at`

2. **Environment Variables** (in `.env.local`):
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@...
   GOOGLE_PRIVATE_KEY=your_private_key
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

1. **Reads breweries** from Google Sheets
2. **Checks update frequency** - Only fetches reviews for breweries that haven't been updated in the last 7 days
3. **Finds Place IDs** (if not already stored):
   - Uses Text Search API to find Place ID for each brewery
   - Stores Place ID in `place_id` column (AL) for future use
4. **Fetches reviews** using Place Details API (only for breweries that need updates)
5. **Writes reviews** to "Reviews" sheet (one row per review)
6. **Updates summary** in main sheet:
   - `google_rating` - Overall rating (e.g., 4.5)
   - `google_rating_count` - Total number of reviews
   - `google_reviews_last_updated` - Timestamp of last fetch

## Weekly Update Frequency

The script automatically skips breweries that were updated within the last 7 days. This means:
- **First run**: Fetches reviews for all breweries
- **Subsequent runs**: Only fetches reviews for breweries that haven't been updated in the past week
- **Result**: Each brewery gets updated approximately once per week, reducing API costs and avoiding unnecessary requests

You can run the script daily, and it will automatically only process breweries that need updates.

## Cost Considerations

- **Initial run**: ~$4.90 for 100 breweries (Text Search + Place Details)
- **Subsequent runs**: ~$1.70 for 100 breweries (Place Details only, using stored Place IDs)
- **With weekly frequency**: Even if you run the script daily, it only processes ~14 breweries per day (100 ÷ 7 days)
- **Daily script runs with weekly updates**: ~$24/month (much cheaper than updating all 100 daily)
- **Weekly script runs**: ~$7/month

## Rate Limiting

The script automatically rate-limits to ~40 requests/second to stay within Google API limits.

## Troubleshooting

### "API REQUEST DENIED" or "API keys with referer restrictions cannot be used"

**This is the most common issue!** Your API key has referer restrictions (for website use), but server-side scripts can't use those.

**Solution**: Create a separate API key for server-side use:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create a new API key
3. Set "Application restrictions" to **"None"** (for server-side)
4. Set "API restrictions" to only: Places API (Text Search) and Places API (Place Details)
5. Add to `.env.local` as `GOOGLE_MAPS_API_KEY=your_new_key`

See `TROUBLESHOOTING_API_KEY_RESTRICTIONS.md` for detailed instructions.

### "Could not find Place ID"
- The brewery might not be listed on Google Maps
- Try checking the brewery name/address in Google Maps manually
- The script will skip breweries without Place IDs

### "Could not get Place Details"
- Place might not have reviews yet
- API quota might be exceeded
- Check API key permissions

### "Could not find Place ID"
- The brewery might not be listed on Google Maps
- Try checking the brewery name/address in Google Maps manually
- The script will skip breweries without Place IDs

### "Could not get Place Details"
- Place might not have reviews yet
- API quota might be exceeded
- Check API key permissions

## Notes

- The script will skip breweries that don't have Place IDs
- Reviews are appended to the Reviews sheet (not replaced)
- To avoid duplicates, you may want to clear the Reviews sheet before running, or add logic to check for existing reviews
- Place IDs are stored for efficiency - subsequent runs are ~50% cheaper

