# Fetch Brewery News Script

Fetches news articles from Google News RSS for breweries and stores them in Supabase.

## Overview

This script:
- Fetches all breweries from Supabase
- For each brewery, queries Google News RSS with a search query: `"[Brewery Name]" Maryland brewery`
- Parses RSS feeds using `rss-parser`
- Scores articles for relevance based on:
  - Brewery name in title/description
  - Maryland news sources
  - Beer-related keywords
  - Article age
- Filters articles with relevance score > 0.4
- Saves top 10 articles per brewery to the `brewery_articles` table
- Only updates breweries that haven't been updated in 7+ days (unless `--force` is used)

## Prerequisites

1. **Database Migration**: Run the migration to create the `brewery_articles` table:
   ```bash
   supabase db push
   ```

2. **Environment Variables**: Ensure `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Dependencies**: Install required packages:
   ```bash
   npm install rss-parser
   ```

## Usage

### Basic Usage

```bash
# Normal run (only updates breweries not updated in last 7 days)
npx tsx scripts/fetch-brewery-news.ts
```

### Options

```bash
# Dry run (test without saving to database)
npx tsx scripts/fetch-brewery-news.ts --dry-run

# Force update all breweries (ignore 7-day limit)
npx tsx scripts/fetch-brewery-news.ts --force

# Limit to first N breweries
npx tsx scripts/fetch-brewery-news.ts --limit=10

# Process single brewery by name
npx tsx scripts/fetch-brewery-news.ts --brewery="Flying Dog"

# Combine options
npx tsx scripts/fetch-brewery-news.ts --dry-run --limit=5
```

## Relevance Scoring

Articles are scored from 0.0 to 1.0 based on:

- **Base Score**: 0.5
- **Brewery Name in Title**: +0.3
- **Brewery Name in Description**: +0.2
- **Maryland News Source**: +0.2
- **Beer-Related Keywords**: +0.1 per keyword (max +0.2)
- **Old Article (>1 year)**: -0.1

Only articles with a score > 0.4 are saved.

## Maryland News Sources

The script boosts relevance for articles from:
- baltimoresun.com
- washingtonpost.com
- baltimorebrew.com
- dcist.com
- marylandmatters.org
- wtop.com
- wbal.com
- wjz.com
- foxbaltimore.com
- cbsnews.com/baltimore
- nbcwashington.com
- abc7news.com

## Output

The script logs:
- Total breweries found
- Number of breweries to process
- For each brewery:
  - Number of articles found
  - Number of relevant articles saved
- Summary statistics

## Database Schema

Articles are stored in the `brewery_articles` table with:
- `brewery_id`: Reference to brewery
- `title`: Article title
- `description`: Article description/snippet
- `url`: Article URL (unique per brewery)
- `source`: News source domain
- `author`: Article author (if available)
- `image_url`: Article image (if available)
- `published_at`: Publication date
- `relevance_score`: Calculated relevance (0.0-1.0)
- `fetched_at`: When article was fetched

## Rate Limiting

The script includes a 1-second delay between brewery processing to avoid rate limiting.

## Notes

- Google News RSS is free and doesn't require an API key
- RSS feeds may have rate limits, so the script processes breweries sequentially
- Articles are deduplicated by URL per brewery
- Only the top 10 articles per brewery are saved (sorted by relevance)

