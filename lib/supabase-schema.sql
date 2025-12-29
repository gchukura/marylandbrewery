-- Supabase Database Schema for Maryland Brewery Directory
-- Run this in your Supabase SQL editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries (optional but recommended for location-based features)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Breweries table
CREATE TABLE IF NOT EXISTS breweries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type JSONB, -- Can be string or array of strings
  
  -- Location
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MD',
  zip TEXT,
  county TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  
  -- Contact
  phone TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',
  
  -- Hours (stored as JSONB)
  hours JSONB DEFAULT '{}',
  
  -- Features
  amenities JSONB DEFAULT '[]',
  allows_visitors BOOLEAN DEFAULT false,
  offers_tours BOOLEAN DEFAULT false,
  beer_to_go BOOLEAN DEFAULT false,
  has_merch BOOLEAN DEFAULT false,
  memberships JSONB DEFAULT '[]',
  
  -- Additional fields
  food TEXT,
  other_drinks TEXT,
  parking TEXT,
  dog_friendly BOOLEAN DEFAULT false,
  outdoor_seating BOOLEAN DEFAULT false,
  logo TEXT,
  featured BOOLEAN DEFAULT false,
  special_events JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  
  -- Metadata
  opened_date TEXT,
  
  -- Google Reviews summary
  google_rating DOUBLE PRECISION,
  google_rating_count INTEGER,
  google_reviews_last_updated TIMESTAMPTZ,
  place_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_breweries_city ON breweries(city);
CREATE INDEX IF NOT EXISTS idx_breweries_county ON breweries(county);
CREATE INDEX IF NOT EXISTS idx_breweries_slug ON breweries(slug);
CREATE INDEX IF NOT EXISTS idx_breweries_featured ON breweries(featured);
CREATE INDEX IF NOT EXISTS idx_breweries_place_id ON breweries(place_id);
CREATE INDEX IF NOT EXISTS idx_breweries_location ON breweries USING GIST(
  ST_MakePoint(longitude, latitude)
);

-- GIN indexes for JSONB columns (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_breweries_type ON breweries USING GIN(type);
CREATE INDEX IF NOT EXISTS idx_breweries_amenities ON breweries USING GIN(amenities);

-- Full-text search index on name and description
CREATE INDEX IF NOT EXISTS idx_breweries_search ON breweries USING GIN(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- Beers table
CREATE TABLE IF NOT EXISTS beers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brewery_id TEXT NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style TEXT,
  abv TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for beers
CREATE INDEX IF NOT EXISTS idx_beers_brewery_id ON beers(brewery_id);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  source TEXT
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_breweries_updated_at BEFORE UPDATE ON breweries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beers_updated_at BEFORE UPDATE ON beers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE breweries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access to breweries and beers
CREATE POLICY "Public can read breweries" ON breweries
  FOR SELECT USING (true);

CREATE POLICY "Public can read beers" ON beers
  FOR SELECT USING (true);

-- Policies: Only authenticated users can insert/update/delete
-- Adjust these based on your authentication needs
CREATE POLICY "Service role can manage breweries" ON breweries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage beers" ON beers
  FOR ALL USING (auth.role() = 'service_role');

-- Newsletter: Allow public to insert (for signups), but only service role can read
CREATE POLICY "Public can insert newsletter subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read newsletter subscribers" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'service_role');

-- Reviews table (for Google Reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brewery_id TEXT NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  brewery_name TEXT NOT NULL,
  reviewer_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TEXT, -- Relative time description (e.g., "2 months ago")
  review_timestamp BIGINT, -- Unix timestamp
  reviewer_url TEXT,
  profile_photo_url TEXT,
  language TEXT DEFAULT 'en',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_brewery_id ON reviews(brewery_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_timestamp ON reviews(review_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_fetched_at ON reviews(fetched_at DESC);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access to reviews
CREATE POLICY "Public can read reviews" ON reviews
  FOR SELECT USING (true);

-- Policies: Only service role can insert/update/delete
CREATE POLICY "Service role can manage reviews" ON reviews
  FOR ALL USING (auth.role() = 'service_role');

