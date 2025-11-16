-- Optional PostGIS Function for Nearby Breweries
-- This function provides better performance for location-based queries
-- Run this in your Supabase SQL Editor after setting up PostGIS

-- Function to get nearby breweries using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_breweries(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  type JSONB,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  social_media JSONB,
  hours JSONB,
  amenities JSONB,
  allows_visitors BOOLEAN,
  offers_tours BOOLEAN,
  beer_to_go BOOLEAN,
  has_merch BOOLEAN,
  memberships JSONB,
  food TEXT,
  other_drinks TEXT,
  parking TEXT,
  dog_friendly BOOLEAN,
  outdoor_seating BOOLEAN,
  logo TEXT,
  featured BOOLEAN,
  special_events JSONB,
  awards JSONB,
  certifications JSONB,
  opened_date TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.*,
    ST_Distance(
      ST_MakePoint(b.longitude, b.latitude)::geography,
      ST_MakePoint(lng, lat)::geography
    ) AS distance_meters
  FROM breweries b
  WHERE ST_DWithin(
    ST_MakePoint(b.longitude, b.latitude)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_breweries TO anon, authenticated;

