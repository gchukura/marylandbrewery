-- One row per review. Before applying, remove existing copies (the constraint can't be
-- added while they exist):
--   npm run data:reviews:dedupe -- --dry-run   # review what would be deleted
--   npm run data:reviews:dedupe
-- writeReviewsToSupabase upserts on these columns once this is applied.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_unique_review') THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_unique_review UNIQUE (brewery_id, source, review_timestamp, reviewer_name);
  END IF;
END $$;
