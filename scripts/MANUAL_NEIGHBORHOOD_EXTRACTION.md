# Manual Neighborhood Extraction Guide

Since homes.com is blocking automated access, here are alternative approaches to get the 707 Maryland neighborhoods:

## Option 1: Browser Extension Export

1. **Install a data extraction extension**:
   - [Web Scraper](https://chrome.google.com/webstore/detail/web-scraper-free-web-scra/jnhgnonknehpejjnehehllkliplmbmhn) (Chrome)
   - [Data Miner](https://chrome.google.com/webstore/detail/data-miner/ibinfkgeggmkjecmhdnlbahcbfhfgdop) (Chrome)

2. **Set up the scraper**:
   - Go to https://www.homes.com/neighborhood-search/maryland/
   - Create a selector for neighborhood cards
   - Extract: name, description, city, URL
   - Configure pagination to go through all pages
   - Export as CSV

3. **Import to Supabase**:
   - Use the CSV import script (see below)

## Option 2: Manual CSV Creation

1. **Visit each page** and copy neighborhood data into a CSV:
   ```csv
   name,description,city,county,url
   "Fells Point","Historic waterfront neighborhood...","Baltimore","Baltimore City","https://www.homes.com/..."
   ```

2. **Save as** `neighborhoods.csv` in the project root

3. **Run import script**:
   ```bash
   npx tsx scripts/import-neighborhoods-csv.ts
   ```

## Option 3: API/Alternative Data Source

Consider using:
- **Census Bureau data** for neighborhood boundaries
- **OpenStreetMap** for neighborhood data
- **Local government GIS data**
- **Real estate APIs** (Zillow, Realtor.com APIs if available)

## Option 4: Contact homes.com

Request API access or data export for research/educational purposes.

## CSV Import Script

If you create a CSV manually, use this script to import:

```typescript
// scripts/import-neighborhoods-csv.ts
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { supabaseAdmin } from '../lib/supabase';
import { slugify } from '../src/lib/data-utils';

const csv = readFileSync('neighborhoods.csv', 'utf-8');
const records = parse(csv, { columns: true, skip_empty_lines: true });

for (const record of records) {
  await supabaseAdmin.from('maryland_neighborhoods').upsert({
    name: record.name,
    slug: slugify(record.name),
    description: record.description,
    city: record.city,
    county: record.county,
    state: 'MD',
    url: record.url,
    homes_url: record.url,
  }, { onConflict: 'slug' });
}
```

