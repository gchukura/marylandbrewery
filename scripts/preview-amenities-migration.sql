-- Preview: See what amenities would be populated for each brewery
-- Run this in Supabase SQL Editor BEFORE running the migration to verify the mapping

SELECT 
  name,
  -- Current source columns
  allows_visitors,
  offers_tours,
  beer_to_go,
  has_merch,
  food,
  other_drinks,
  parking,
  dog_friendly,
  outdoor_seating,
  -- Current amenities (should be empty/null)
  amenities AS current_amenities,
  -- What the new amenities would be
  (
    SELECT jsonb_agg(amenity)
    FROM (
      SELECT 'Tours' AS amenity WHERE breweries.offers_tours = true
      UNION ALL
      SELECT 'Beer To Go' WHERE breweries.beer_to_go = true
      UNION ALL
      SELECT 'Merchandise' WHERE breweries.has_merch = true
      UNION ALL
      SELECT 'Pet Friendly' WHERE breweries.dog_friendly = true
      UNION ALL
      SELECT 'Outdoor Seating' WHERE breweries.outdoor_seating = true
      UNION ALL
      SELECT 'Allows Visitors' WHERE breweries.allows_visitors = true
      UNION ALL
      SELECT 'Food' WHERE breweries.food IS NOT NULL AND breweries.food != '' AND breweries.food != 'No' AND breweries.food != 'None'
      UNION ALL
      SELECT 'Food Trucks' WHERE breweries.food IS NOT NULL AND LOWER(breweries.food) LIKE '%truck%'
      UNION ALL
      SELECT 'Full Kitchen' WHERE breweries.food IS NOT NULL AND (LOWER(breweries.food) LIKE '%kitchen%' OR LOWER(breweries.food) LIKE '%in-house%' OR LOWER(breweries.food) LIKE '%in house%' OR LOWER(breweries.food) LIKE '%restaurant%')
      UNION ALL
      SELECT 'Parking' WHERE breweries.parking IS NOT NULL AND breweries.parking != '' AND breweries.parking != 'No' AND breweries.parking != 'None' AND LOWER(breweries.parking) != 'no'
      UNION ALL
      SELECT 'Other Drinks' WHERE breweries.other_drinks IS NOT NULL AND breweries.other_drinks != '' AND LOWER(breweries.other_drinks) != 'no'
    ) AS amenities_list
    WHERE amenity IS NOT NULL
  ) AS proposed_amenities
FROM breweries
ORDER BY name
LIMIT 50;


-- Summary: Count how many breweries would get each amenity
SELECT 'Tours' AS amenity, COUNT(*) AS brewery_count FROM breweries WHERE offers_tours = true
UNION ALL
SELECT 'Beer To Go', COUNT(*) FROM breweries WHERE beer_to_go = true
UNION ALL
SELECT 'Merchandise', COUNT(*) FROM breweries WHERE has_merch = true
UNION ALL
SELECT 'Pet Friendly', COUNT(*) FROM breweries WHERE dog_friendly = true
UNION ALL
SELECT 'Outdoor Seating', COUNT(*) FROM breweries WHERE outdoor_seating = true
UNION ALL
SELECT 'Allows Visitors', COUNT(*) FROM breweries WHERE allows_visitors = true
UNION ALL
SELECT 'Food (any)', COUNT(*) FROM breweries WHERE food IS NOT NULL AND food != '' AND food != 'No' AND food != 'None'
UNION ALL
SELECT 'Parking', COUNT(*) FROM breweries WHERE parking IS NOT NULL AND parking != '' AND parking != 'No' AND parking != 'None' AND LOWER(parking) != 'no'
UNION ALL
SELECT 'Other Drinks', COUNT(*) FROM breweries WHERE other_drinks IS NOT NULL AND other_drinks != '' AND LOWER(other_drinks) != 'no'
ORDER BY brewery_count DESC;

