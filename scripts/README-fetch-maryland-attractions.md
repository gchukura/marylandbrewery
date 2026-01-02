# Fetch Maryland Attractions Script

This script fetches Maryland attractions from Google Places API and stores them in the Supabase `maryland_attractions` table for SEO enhancement.

## Overview

The script performs two types of searches:

1. **City-based search**: Searches for attractions near each city that has breweries
2. **Grid search**: Performs a systematic grid search across Maryland to find attractions in areas without breweries

## Prerequisites

1. **Environment Variables** (in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for write access)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `GOOGLE_MAPS_API_KEY` - Google Maps API key

2. **Google Cloud Console Setup**:
   - Enable "Places API (Nearby Search)"
   - Enable "Places API (Place Details)"
   - Create an API key with:
     - **Application restrictions**: "None" (required for server-side scripts)
     - **API restrictions**: Only enable the two Places APIs listed above

3. **Database**:
   - The `maryland_attractions` table must exist (run the migration first)

## Usage

### Basic Usage

```bash
# Dry run (preview what would be fetched without writing to database)
npx tsx scripts/fetch-maryland-attractions.ts --dry-run

# Full run (fetch and store all attractions)
npx tsx scripts/fetch-maryland-attractions.ts
```

### Filtered Usage

```bash
# Search only in a specific city
npx tsx scripts/fetch-maryland-attractions.ts --city=Baltimore

# Search only for a specific type
npx tsx scripts/fetch-maryland-attractions.ts --type=museum

# Combine filters
npx tsx scripts/fetch-maryland-attractions.ts --city=Annapolis --type=park
```

## Attraction Types

The script searches for the following Google Places types and maps them to simplified categories:

| Google Type | Our Category |
|------------|--------------|
| tourist_attraction | landmark |
| museum | museum |
| park | park |
| amusement_park, zoo, aquarium, stadium, movie_theater, bowling_alley, casino, night_club, spa | entertainment |
| art_gallery | museum |
| shopping_mall | shopping |
| campground | park |
| restaurant | restaurant |
| landmark, point_of_interest | landmark |

## Search Strategy

1. **City Search**:
   - Fetches all unique cities from the `breweries` table
   - For each city, searches for all attraction types within 10km radius
   - Uses city coordinates from breweries (average if multiple breweries)

2. **Grid Search**:
   - Creates a grid across Maryland bounds (lat 37.9-39.7, lng -79.5 to -75.0)
   - Searches key attraction types (tourist_attraction, museum, park, amusement_park, zoo)
   - Uses 25km radius per grid point
   - Limited to prevent excessive API calls

## Rate Limiting

- **Delay between requests**: 200ms
- **Maximum requests per city**: 50
- The script automatically handles rate limiting to stay within API quotas

## Data Stored

For each attraction, the script stores:

- **Basic Info**: name, slug, type, description
- **Location**: street, city, state, zip, county, latitude, longitude
- **Contact**: phone, website
- **Google Data**: place_id, google_types, rating, rating_count, price_level, hours, photos
- **Metadata**: last_updated, created_at, updated_at

## Deduplication

Attractions are deduplicated by `place_id` using Supabase's `upsert` with `onConflict: 'place_id'`. This means:

- If an attraction already exists, it will be updated with the latest data
- If it's new, it will be inserted

## Error Handling

The script handles common errors:

- **API Key Issues**: Detects referer restriction errors and provides clear instructions
- **Quota Exceeded**: Stops execution and reports the issue
- **Network Errors**: Logs warnings and continues with next item
- **Invalid Data**: Skips attractions that don't meet criteria (e.g., not in Maryland)

## Output

The script provides detailed console output:

```
🏛️  Maryland Attractions Fetcher
================================
Mode: LIVE
Found 50 unique cities with breweries

📍 Searching attractions near Baltimore...
  ✓ Found 45 places, upserted 38 attractions

📍 Searching attractions near Annapolis...
  ✓ Found 32 places, upserted 28 attractions

🗺️  Performing grid search across Maryland...
  ✓ Found 120 places, upserted 95 attractions

✅ Complete! Total attractions upserted: 161
```

## Troubleshooting

### "API request denied: referer restrictions"

**Problem**: Your API key has HTTP referer restrictions, which don't work for server-side scripts.

**Solution**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create a new API key
3. Set "Application restrictions" to "None"
4. Set "API restrictions" to only: Places API (Nearby Search) and Places API (Place Details)
5. Add the new key to `.env.local` as `GOOGLE_MAPS_API_KEY`

### "API quota exceeded"

**Problem**: You've hit your Google Maps API quota limit.

**Solution**:
- Wait for the quota to reset (usually daily)
- Consider upgrading your API quota in Google Cloud Console
- Use `--city` or `--type` filters to reduce the number of requests

### "No coordinates found for [city]"

**Problem**: The script can't find coordinates for a city.

**Solution**: This is usually fine - the script will skip cities without coordinates. You can manually search specific cities if needed.

## Notes

- The script only includes attractions in Maryland (state = 'MD')
- Attractions are filtered to ensure they have valid coordinates
- The script respects the `--dry-run` flag and won't write to the database in that mode
- Grid search is limited to prevent excessive API usage

