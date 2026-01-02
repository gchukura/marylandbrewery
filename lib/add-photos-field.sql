-- Add photos array field to breweries table
-- Run this in your Supabase SQL editor to add the photos field

ALTER TABLE breweries ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

-- Add comment to document the field
COMMENT ON COLUMN breweries.photos IS 'Array of photo paths stored locally (e.g., ["/photos/brewery-1.jpg", "/photos/brewery-2.jpg"])';

-- Add GIN index for efficient querying of photos array
CREATE INDEX IF NOT EXISTS idx_breweries_photos ON breweries USING GIN(photos);

