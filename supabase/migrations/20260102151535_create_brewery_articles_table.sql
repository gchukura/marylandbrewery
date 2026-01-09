CREATE TABLE IF NOT EXISTS brewery_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id TEXT NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT,
  author TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  relevance_score FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brewery_id, url)
);

CREATE INDEX IF NOT EXISTS idx_brewery_articles_brewery_id ON brewery_articles(brewery_id);
CREATE INDEX IF NOT EXISTS idx_brewery_articles_published_at ON brewery_articles(published_at DESC NULLS LAST);

ALTER TABLE brewery_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read brewery_articles" ON brewery_articles FOR SELECT USING (true);
CREATE POLICY "Service role can manage brewery_articles" ON brewery_articles FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE breweries ADD COLUMN IF NOT EXISTS articles_last_updated TIMESTAMPTZ;

