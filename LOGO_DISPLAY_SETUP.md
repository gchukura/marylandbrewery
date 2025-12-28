# Logo Display Setup

## Overview
Your codebase is configured to display brewery logos from the `public/logos/` directory on individual brewery detail pages.

## How It Works

### 1. **Logo Storage**
- Logos are stored in: `public/logos/`
- Files are named like: `1623-brewing-company.png`, `1812-brewery.png`, etc.
- Currently: **136 logo files** in the directory

### 2. **Google Sheets Path Format**
In your Google Sheets, the `logo` column should contain:
- **Local path**: `/logos/brewery-name.png` (recommended)
- **External URL**: `https://example.com/logo.png` (also supported)

### 3. **Next.js Serving**
Next.js automatically serves files from the `public` directory:
- `public/logos/brewery-name.png` → accessible at `/logos/brewery-name.png`
- No configuration needed - it just works!

### 4. **Component Implementation**
- **Component**: `BreweryLogo` (`src/components/brewery/BreweryLogo.tsx`)
- **Used in**: `SimpleBreweryPageTemplate` (brewery detail pages)
- **Features**:
  - Handles both local paths (`/logos/...`) and external URLs (`https://...`)
  - Error handling (hides image if it fails to load)
  - Loading state with fade-in animation
  - Responsive sizing (sm, md, lg, xl)

## Example

If Google Sheets has:
```
logo: /logos/1623-brewing-company.png
```

The brewery detail page will display:
- Image from: `public/logos/1623-brewing-company.png`
- Served at: `https://yourdomain.com/logos/1623-brewing-company.png`

## Verification

✅ **Logo directory exists**: `public/logos/` with 136 files
✅ **Component created**: `BreweryLogo.tsx` handles path normalization
✅ **Template updated**: `SimpleBreweryPageTemplate.tsx` uses the component
✅ **Error handling**: Images that fail to load are hidden gracefully
✅ **Path support**: Both local paths and external URLs work

## Testing

To verify logos are displaying correctly:

1. **Check a brewery page** that has a logo in Google Sheets
2. **View the page source** and look for the `<img>` tag
3. **Verify the src attribute** matches the path in Google Sheets
4. **Check browser console** for any 404 errors (image not found)

## Troubleshooting

### Logo not displaying?

1. **Check the path in Google Sheets**:
   - Should be: `/logos/brewery-name.png` (with leading slash)
   - Not: `logos/brewery-name.png` (without leading slash)

2. **Verify file exists**:
   ```bash
   ls public/logos/brewery-name.png
   ```

3. **Check browser console**:
   - Look for 404 errors
   - Verify the URL being requested

4. **File naming**:
   - Filenames should match what's in Google Sheets
   - Case-sensitive on some systems

### Logo shows broken image?

- The component automatically hides broken images
- Check that the file exists in `public/logos/`
- Verify the filename matches exactly (including extension)

## Next Steps

1. ✅ Run the logo fetching script to download missing logos
2. ✅ Verify logos display correctly on brewery pages
3. ✅ Check `BREWERY_LOGOS_MISSING.md` for any that need manual attention

