-- Maryland Neighborhoods table for SEO enhancement
CREATE TABLE IF NOT EXISTS maryland_neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  city TEXT,
  county TEXT,
  state TEXT NOT NULL DEFAULT 'MD',
  url TEXT,
  homes_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON maryland_neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_county ON maryland_neighborhoods(county);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON maryland_neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_state ON maryland_neighborhoods(state);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_neighborhoods_search ON maryland_neighborhoods USING GIN(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, ''))
);

-- RLS policies
ALTER TABLE maryland_neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to neighborhoods"
  ON maryland_neighborhoods FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service role full access to neighborhoods"
  ON maryland_neighborhoods FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

