-- Enable PostGIS if not already enabled (matches lib/supabase-schema.sql pattern)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Maryland Attractions table for SEO enhancement
CREATE TABLE IF NOT EXISTS maryland_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Categorization
  type TEXT NOT NULL, -- 'park', 'museum', 'restaurant', 'landmark', 'shopping', 'entertainment'
  google_types JSONB DEFAULT '[]', -- Array of Google Places types
  
  -- Location (matches breweries table pattern)
  street TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MD',
  zip TEXT,
  county TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  
  -- Details
  description TEXT,
  phone TEXT,
  website TEXT,
  
  -- Google Places data
  rating DOUBLE PRECISION,
  rating_count INTEGER,
  price_level INTEGER, -- 0-4 scale
  hours JSONB DEFAULT '{}',
  photos JSONB DEFAULT '[]', -- Array of photo references
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes matching your existing patterns in lib/supabase-schema.sql
CREATE INDEX IF NOT EXISTS idx_attractions_city ON maryland_attractions(city);
CREATE INDEX IF NOT EXISTS idx_attractions_county ON maryland_attractions(county);
CREATE INDEX IF NOT EXISTS idx_attractions_type ON maryland_attractions(type);
CREATE INDEX IF NOT EXISTS idx_attractions_slug ON maryland_attractions(slug);
CREATE INDEX IF NOT EXISTS idx_attractions_place_id ON maryland_attractions(place_id);

-- PostGIS spatial index (matches idx_breweries_location pattern)
CREATE INDEX IF NOT EXISTS idx_attractions_location ON maryland_attractions USING GIST(
  ST_MakePoint(longitude, latitude)
);

-- Full-text search (matches idx_breweries_search pattern)
CREATE INDEX IF NOT EXISTS idx_attractions_search ON maryland_attractions USING GIN(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- RLS policies (matches breweries table pattern)
ALTER TABLE maryland_attractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to attractions"
  ON maryland_attractions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service role full access to attractions"
  ON maryland_attractions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PostGIS function for nearby attractions (matches get_nearby_breweries in lib/supabase-postgis-function.sql)
CREATE OR REPLACE FUNCTION get_nearby_attractions(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION,
  attraction_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  place_id TEXT,
  name TEXT,
  slug TEXT,
  type TEXT,
  google_types JSONB,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  phone TEXT,
  website TEXT,
  rating DOUBLE PRECISION,
  rating_count INTEGER,
  price_level INTEGER,
  hours JSONB,
  photos JSONB,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.place_id, a.name, a.slug, a.type, a.google_types,
    a.street, a.city, a.state, a.zip, a.county,
    a.latitude, a.longitude, a.description, a.phone, a.website,
    a.rating, a.rating_count, a.price_level, a.hours, a.photos,
    a.last_updated, a.created_at, a.updated_at,
    ST_Distance(
      ST_MakePoint(a.longitude, a.latitude)::geography,
      ST_MakePoint(lng, lat)::geography
    ) AS distance_meters
  FROM maryland_attractions a
  WHERE ST_DWithin(
    ST_MakePoint(a.longitude, a.latitude)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_meters
  )
  AND (attraction_type IS NULL OR a.type = attraction_type)
  ORDER BY distance_meters;
END;
$$;

GRANT EXECUTE ON FUNCTION get_nearby_attractions TO anon, authenticated;

