-- Add Yelp Reviews support to database
-- This migration adds Yelp review summary fields to the breweries table
-- and ensures the reviews table has the source field

-- Add Yelp fields to breweries table
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS yelp_business_id TEXT;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS yelp_rating DOUBLE PRECISION;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS yelp_rating_count INTEGER;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS yelp_reviews_last_updated TIMESTAMPTZ;

-- Add source field to reviews table (if not exists)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'google';

-- Update existing reviews to have 'google' as source
UPDATE reviews SET source = 'google' WHERE source IS NULL;

-- Add indexes for source field
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);
CREATE INDEX IF NOT EXISTS idx_reviews_brewery_source ON reviews(brewery_id, source);

-- Add comments
COMMENT ON COLUMN breweries.yelp_business_id IS 'Yelp Business ID for efficient API calls';
COMMENT ON COLUMN breweries.yelp_rating IS 'Overall Yelp rating (1-5)';
COMMENT ON COLUMN breweries.yelp_rating_count IS 'Total number of Yelp reviews';
COMMENT ON COLUMN breweries.yelp_reviews_last_updated IS 'Timestamp of last Yelp reviews update';
COMMENT ON COLUMN reviews.source IS 'Review source: google or yelp';

