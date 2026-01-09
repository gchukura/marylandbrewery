-- Migration: Populate amenities array from individual boolean/text columns
-- This combines data from allows_visitors, offers_tours, beer_to_go, has_merch,
-- food, other_drinks, parking, dog_friendly, outdoor_seating into the amenities JSONB array

-- First, let's see what we're working with (for debugging - can be removed)
-- SELECT id, name, allows_visitors, offers_tours, beer_to_go, has_merch, 
--        food, other_drinks, parking, dog_friendly, outdoor_seating, amenities
-- FROM breweries LIMIT 5;

-- Update all breweries to populate the amenities column
UPDATE breweries
SET amenities = (
  SELECT jsonb_agg(amenity)
  FROM (
    -- Boolean columns mapped to amenity strings
    SELECT 'Tours' AS amenity WHERE offers_tours = true
    UNION ALL
    SELECT 'Beer To Go' WHERE beer_to_go = true
    UNION ALL
    SELECT 'Merchandise' WHERE has_merch = true
    UNION ALL
    SELECT 'Pet Friendly' WHERE dog_friendly = true
    UNION ALL
    SELECT 'Outdoor Seating' WHERE outdoor_seating = true
    UNION ALL
    SELECT 'Allows Visitors' WHERE allows_visitors = true
    UNION ALL
    -- Food column - add appropriate amenity based on value
    SELECT 'Food' WHERE food IS NOT NULL AND food != '' AND food != 'No' AND food != 'None'
    UNION ALL
    SELECT 'Food Trucks' WHERE food IS NOT NULL AND LOWER(food) LIKE '%truck%'
    UNION ALL
    SELECT 'Full Kitchen' WHERE food IS NOT NULL AND (LOWER(food) LIKE '%kitchen%' OR LOWER(food) LIKE '%in-house%' OR LOWER(food) LIKE '%in house%' OR LOWER(food) LIKE '%restaurant%')
    UNION ALL
    -- Parking column
    SELECT 'Parking' WHERE parking IS NOT NULL AND parking != '' AND parking != 'No' AND parking != 'None' AND LOWER(parking) != 'no'
    UNION ALL
    -- Other drinks
    SELECT 'Other Drinks' WHERE other_drinks IS NOT NULL AND other_drinks != '' AND LOWER(other_drinks) != 'no'
  ) AS amenities_list
  WHERE amenity IS NOT NULL
),
updated_at = NOW()
WHERE 
  -- Only update rows that have at least one amenity-related column set
  offers_tours = true 
  OR beer_to_go = true 
  OR has_merch = true 
  OR dog_friendly = true 
  OR outdoor_seating = true 
  OR allows_visitors = true
  OR (food IS NOT NULL AND food != '' AND food != 'No' AND food != 'None')
  OR (parking IS NOT NULL AND parking != '' AND parking != 'No' AND parking != 'None')
  OR (other_drinks IS NOT NULL AND other_drinks != '' AND LOWER(other_drinks) != 'no');

-- Set empty array for breweries that don't have any amenities (rather than null)
UPDATE breweries
SET amenities = '[]'::jsonb
WHERE amenities IS NULL;

-- Verify the results
-- SELECT name, amenities FROM breweries WHERE jsonb_array_length(amenities) > 0 LIMIT 10;

