-- Add photo_url column to breweries table
-- Run this in your Supabase SQL editor to add the photo_url field

ALTER TABLE breweries ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN breweries.photo_url IS 'URL to brewery photo from Google Places API';

