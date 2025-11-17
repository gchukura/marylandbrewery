# Google Maps Migration Summary

## ✅ Migration Complete

Your Maryland Brewery Directory has been successfully migrated from Mapbox to Google Maps!

## What Changed

### New Files Created

1. **`src/components/maps/GoogleMap.tsx`** - New Google Maps component using @vis.gl/react-google-maps
2. **`src/lib/google-maps-config.ts`** - Google Maps configuration (replaces mapbox-config.ts)

### Files Modified

1. **`src/components/brewery/BreweryMap.tsx`** - Now uses GoogleMap component
2. **`src/components/templates/*.tsx`** - All templates updated to use GoogleMap
3. **`src/app/map/MapClient.tsx`** - Updated to use GoogleMap
4. **`src/app/city/page.tsx`** - Updated to use GoogleMap
5. **`src/app/city/[city]/breweries/page.tsx`** - Updated to use GoogleMap
6. **`src/components/home/MapAndTableSection.tsx`** - Updated to use GoogleMap
7. **`next.config.ts`** - Removed Mapbox domain, kept Google Maps
8. **`package.json`** - Removed Mapbox dependencies, added Google Maps packages
9. **`README.md`** - Updated documentation

### Files Kept (for reference)

1. **`src/components/maps/MapboxMap.tsx`** - Old Mapbox component (can be removed)
2. **`src/lib/mapbox-config.ts`** - Old Mapbox config (can be removed)

## New Dependencies

- `@vis.gl/react-google-maps` - Official Google Maps React library
- `@googlemaps/markerclusterer` - Marker clustering for Google Maps

## Removed Dependencies

- `mapbox-gl` - Mapbox GL JS
- `@types/mapbox-gl` - TypeScript types for Mapbox

## Environment Variables

### Old (Mapbox)
- `NEXT_PUBLIC_MAPBOX_TOKEN` ❌ (no longer needed)

### New (Google Maps)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ✅ (required)

## Getting Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Restrict the API key to:
   - **Application restrictions**: HTTP referrers (for web)
   - **API restrictions**: Maps JavaScript API
6. Copy the API key and add it to your `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
   ```

## Features

✅ **Marker Clustering** - Automatically clusters nearby breweries  
✅ **Info Windows** - Click markers to see brewery details  
✅ **Custom Markers** - Red circular markers matching Maryland theme  
✅ **Bounds Restriction** - Map restricted to Maryland area  
✅ **Responsive** - Works on all screen sizes  
✅ **Performance** - Optimized with React hooks and lazy loading  

## Migration Notes

- **Coordinate Format**: Changed from `[lng, lat]` (Mapbox) to `{lat, lng}` (Google Maps)
- **Component Props**: Most props remain the same, but `center` now uses `{lat, lng}` object instead of array
- **Clustering**: Uses `@googlemaps/markerclusterer` instead of Mapbox's built-in clustering
- **Styling**: Custom map styles can be configured in `google-maps-config.ts`

## Next Steps

1. **Add API Key**: Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment variables
2. **Test**: Verify all map components work correctly
3. **Deploy**: Add the API key to your Vercel environment variables
4. **Clean Up** (optional): Remove old Mapbox files if no longer needed

## Cost Considerations

Google Maps offers a $200/month credit, which typically covers:
- ~28,000 map loads per month
- ~100,000 marker displays per month

For a brewery directory, this should be more than sufficient for most use cases.

## Support

- Google Maps Documentation: https://developers.google.com/maps/documentation/javascript
- @vis.gl/react-google-maps: https://vis.gl/react-google-maps
- Marker Clusterer: https://github.com/googlemaps/js-markerclusterer

