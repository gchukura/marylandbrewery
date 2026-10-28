-- When `npm run data:verify-hours` last found the brewery's hours matching Google's. The brewery
-- page shows "Hours checked {month}" only when this is set. Safe to re-run.
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS hours_verified_at timestamptz;

-- Hours edited any other way (sync, enrich, by hand) are no longer verified
CREATE OR REPLACE FUNCTION clear_hours_verified_at() RETURNS trigger AS $$
BEGIN
  IF NEW.hours IS DISTINCT FROM OLD.hours AND NEW.hours_verified_at IS NOT DISTINCT FROM OLD.hours_verified_at THEN
    NEW.hours_verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS breweries_clear_hours_verified_at ON breweries;
CREATE TRIGGER breweries_clear_hours_verified_at
  BEFORE UPDATE OF hours ON breweries
  FOR EACH ROW EXECUTE FUNCTION clear_hours_verified_at();
