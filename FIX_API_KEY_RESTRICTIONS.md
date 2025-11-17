# Fix Google Maps API Key AuthFailure Error

## ✅ Your API Key is Valid!

The test script confirmed your API key works. The AuthFailure error in the browser is **almost certainly due to API key restrictions**.

## Quick Fix Steps

### Step 1: Open Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Edit Your API Key
1. Click on your API key (the one starting with `AIza...`)
2. Scroll down to **API restrictions** and **Application restrictions**

### Step 3: Fix Application Restrictions

**Option A: Temporarily Remove Restrictions (for testing)**
- Set **Application restrictions** to **"None"**
- Click **Save**
- Test your map - it should work now
- Then add restrictions back (see Option B)

**Option B: Add Your Domains (recommended)**
- Keep **Application restrictions** set to **"HTTP referrers (web sites)"**
- Click **"Add an item"** and add these referrers:
  ```
  localhost:3000/*
  *.vercel.app/*
  https://www.marylandbrewery.com/*
  https://marylandbrewery.com/*
  ```
- **Important:** Add both `www` and non-`www` versions of your domain
- Click **Save**

### Step 4: Verify API Restrictions
- Under **API restrictions**, ensure **"Maps JavaScript API"** is selected
- Or set to **"Don't restrict key"** temporarily to test

### Step 5: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Maps JavaScript API** (required)
   - ✅ **Geocoding API** (optional, for address lookups)

### Step 6: Enable Billing
1. Go to **Billing** in Google Cloud Console
2. Link a billing account (required even for free tier)
3. You get $200/month free credit - you won't be charged for normal usage

### Step 7: Test
1. Restart your dev server: `npm run dev`
2. Clear browser cache or use incognito mode
3. Visit your map page
4. Check browser console for any errors

## Common Error Messages & Solutions

### "RefererNotAllowedMapError"
**Solution:** Add your domain to HTTP referrers (see Step 3, Option B)

### "ApiNotActivatedMapError"  
**Solution:** Enable Maps JavaScript API (see Step 5)

### "InvalidKeyMapError"
**Solution:** 
- Verify you copied the full API key
- Check for extra spaces or quotes
- Make sure it's the correct key from the right project

### "BillingNotEnabledMapError"
**Solution:** Enable billing (see Step 6)

## Testing Your Fix

After making changes:

1. **Wait 1-2 minutes** for changes to propagate
2. **Clear browser cache** or use incognito mode
3. **Restart dev server** if testing locally
4. **Check browser console** for detailed error messages

## Still Not Working?

Run the test script to verify the key:
```bash
npx tsx scripts/test-google-maps-api.ts
```

If the script passes but browser still fails, it's definitely a restriction issue.

## Security Note

After testing, **always add restrictions back**:
- Application restrictions: Your specific domains
- API restrictions: Only Maps JavaScript API

This prevents unauthorized use of your API key.

