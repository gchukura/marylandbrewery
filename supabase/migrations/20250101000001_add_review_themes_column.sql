-- Add review_themes column to breweries table
-- Stores extracted themes as JSONB for flexibility
ALTER TABLE breweries 
ADD COLUMN IF NOT EXISTS review_themes JSONB DEFAULT '{}';

-- Add index for querying breweries by theme
CREATE INDEX IF NOT EXISTS idx_breweries_review_themes 
ON breweries USING GIN(review_themes);

-- Comment for documentation
COMMENT ON COLUMN breweries.review_themes IS 
'Extracted themes from Google/Yelp reviews. Structure: {
  "beer_quality": { "detected": true, "keywords": ["great ipas", "fresh beer"], "score": 0.85 },
  "food_menu": { "detected": true, "keywords": ["amazing food", "great menu"], "score": 0.72 },
  "service_staff": { "detected": true, "keywords": ["friendly staff"], "score": 0.90 },
  "atmosphere": { "detected": false, "keywords": [], "score": 0 },
  "amenities": { 
    "allows_visitors": true,
    "offers_tours": true,
    "beer_to_go": true,
    "has_merch": false,
    "dog_friendly": true,
    "outdoor_seating": true,
    "food": "In-House",
    "other_drinks": "yes",
    "parking": "yes"
  },
  "last_analyzed": "2025-01-01T00:00:00Z",
  "review_count_analyzed": 50
}';

