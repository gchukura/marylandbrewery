# Fetch Brewery Logos Script

This script fetches brewery logos from the Maryland Beer website and downloads them to your codebase.

## What It Does

1. **Fetches breweries** from Google Sheets that don't have logos
2. **Scrapes logos** from `marylandbeer.org/brewing-companies/current-members/`
3. **Downloads logos** to `public/logos/` directory
4. **Updates Google Sheets** with local logo paths (e.g., `/logos/brewery-name.png`)

## Prerequisites

- Environment variables set in `.env.local`:
  - `GOOGLE_SHEET_ID`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`

## Usage

```bash
npx tsx scripts/fetch-brewery-logos.ts
```

## How It Works

### Logo Matching

The script uses multiple strategies to match brewery names to logos:

1. **Exact match**: Normalized brewery name matches exactly
2. **Partial match**: One name contains the other
3. **Suffix removal**: Removes common suffixes like "Brewing", "Brewery", "Brewing Company" and tries again

### Logo Storage

- Logos are saved to: `public/logos/`
- Filenames are sanitized from brewery names (e.g., "1623 Brewing Company" → `1623-brewing-company.png`)
- File extensions are determined from the URL or content type (png, jpg, svg)
- Google Sheets is updated with paths like `/logos/brewery-name.png`

## Output

The script will show:
- How many breweries need logos
- Which logos were found on the Maryland Beer website
- Progress for each brewery
- Summary of downloads, updates, not found, and errors

## Troubleshooting

### "No logos found on Maryland Beer website"

The page structure may have changed. You can:
1. Inspect the page source manually
2. Update the HTML parsing regex patterns in the script
3. Or manually add logos to Google Sheets

### "Logo not found"

The brewery might not be listed on the Maryland Beer website, or the name doesn't match. You can:
1. Check the website manually
2. Add the logo URL directly to Google Sheets
3. Or download the logo manually and add it to `public/logos/`

### "Failed to download"

- Network issues
- Invalid URL
- Server blocking requests

Check the error message for details.

## Notes

- The script only processes breweries that don't already have logos
- Logos are downloaded with a 500ms delay between requests (to be respectful)
- If a logo already exists in `public/logos/`, it will be overwritten
- The script creates the `public/logos/` directory if it doesn't exist

