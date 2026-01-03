# Fetch City Images Script

This script downloads high-quality city images from Pexels API and saves them locally for use as hero images on city brewery pages.

## Setup

1. **Get a free Pexels API key:**
   - Visit https://www.pexels.com/api/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Add API key to `.env.local`:**
   ```bash
   PEXELS_API_KEY=your_api_key_here
   ```

## Usage

```bash
npx tsx scripts/fetch-city-images.ts
```

## What it does

1. Fetches all cities from your brewery data
2. For each city, searches Pexels for images matching "{City} Maryland"
3. Downloads the best landscape-oriented image
4. Saves images to `public/cities/{city-slug}.jpg`
5. Skips cities that already have images

## Rate Limits

- Pexels free tier: 200 requests/hour
- The script includes rate limiting (200ms delay between requests)
- If rate limit is hit, the script waits 60 seconds and retries

## Image Usage

Once images are downloaded, the city brewery pages (`/cities/{city}/breweries`) will automatically:
1. Use the local city image if available
2. Fall back to a brewery photo if no city image exists
3. Show a pattern background if no images are available

## Notes

- Images are saved as JPG format
- Images are optimized for web (large2x size from Pexels)
- Photo attribution is logged but not displayed (Pexels license allows this)
- The script is idempotent - safe to run multiple times

