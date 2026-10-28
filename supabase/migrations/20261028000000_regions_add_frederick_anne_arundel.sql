-- Frederick and Anne Arundel were in no region, so their breweries (17 and 7) appeared on no
-- region page. Use the state's grouping (business.maryland.gov / Maryland Office of Tourism):
-- Frederick is in the Capital Region, Anne Arundel in Central Maryland. Safe to re-run.
UPDATE maryland_regions
SET counties = array_append(counties, 'Frederick'), updated_at = NOW()
WHERE region_slug = 'capital-region' AND NOT ('Frederick' = ANY(counties));

UPDATE maryland_regions
SET counties = array_append(counties, 'Anne Arundel'), updated_at = NOW()
WHERE region_slug = 'central-maryland' AND NOT ('Anne Arundel' = ANY(counties));
