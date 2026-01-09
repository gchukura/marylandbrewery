-- Add geocoding columns to maryland_neighborhoods table
-- This allows storing latitude, longitude, and place_id for neighborhoods

ALTER TABLE maryland_neighborhoods 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS place_id TEXT;

-- Create index on place_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_neighborhoods_place_id ON maryland_neighborhoods(place_id);

-- Create spatial index if PostGIS is enabled (optional)
-- CREATE INDEX IF NOT EXISTS idx_neighborhoods_location ON maryland_neighborhoods USING GIST(
--   ST_MakePoint(longitude, latitude)
-- );

