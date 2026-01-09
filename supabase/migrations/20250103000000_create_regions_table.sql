-- Create Maryland Regions table for regional brewery pages
CREATE TABLE IF NOT EXISTS maryland_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL,
  region_slug TEXT UNIQUE NOT NULL,
  counties TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert region data
INSERT INTO maryland_regions (region_name, region_slug, counties, description) VALUES
('Eastern Shore', 'eastern-shore', ARRAY['Talbot', 'Dorchester', 'Wicomico', 'Worcester', 'Somerset', 'Caroline', 'Kent', 'Queen Anne''s', 'Cecil'], 
 'Maryland''s Eastern Shore offers a relaxed, rural brewery experience with scenic waterfront locations and farm-to-glass craft beer.'),
('Western Maryland', 'western-maryland', ARRAY['Allegany', 'Garrett', 'Washington'],
 'The mountains of Western Maryland are home to breweries that celebrate the region''s natural beauty and outdoor recreation culture.'),
('Central Maryland', 'central-maryland', ARRAY['Baltimore City', 'Baltimore County', 'Howard', 'Carroll', 'Harford'],
 'The heart of Maryland''s craft beer scene, Central Maryland features the highest concentration of breweries from urban Baltimore to suburban Howard County.'),
('Southern Maryland', 'southern-maryland', ARRAY['Calvert', 'Charles', 'St. Mary''s'],
 'Southern Maryland''s waterfront breweries combine craft beer with Chesapeake Bay culture and historic charm.'),
('Capital Region', 'capital-region', ARRAY['Montgomery', 'Prince George''s'],
 'The DC suburbs offer diverse brewery experiences, from upscale taprooms to community-focused brewpubs serving the metropolitan area.');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_regions_slug ON maryland_regions(region_slug);

-- RLS policies
ALTER TABLE maryland_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read regions" ON maryland_regions FOR SELECT USING (true);
CREATE POLICY "Service role can manage regions" ON maryland_regions FOR ALL USING (auth.role() = 'service_role');

