# Troubleshooting Google Maps AuthFailure Error

## Common Causes & Solutions

### 1. API Key Not Enabled for Maps JavaScript API

**Check:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **APIs & Services** → **Enabled APIs**
- Verify **Maps JavaScript API** is enabled
- If not enabled, click **+ ENABLE APIS AND SERVICES** and enable it

### 2. API Key Restrictions Too Strict

**Check your API key restrictions:**

1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Check **Application restrictions**:
   - If set to "HTTP referrers", ensure your domains are added:
     - `localhost:3000/*` (for local development)
     - `*.vercel.app/*` (for Vercel previews)
     - `yourdomain.com/*` (for production)
   - **Temporarily** set to "None" to test if restrictions are the issue

4. Check **API restrictions**:
   - Should include "Maps JavaScript API"
   - Or set to "Don't restrict key" temporarily to test

### 3. API Key Format Issues

**Check:**
- No extra spaces or quotes around the key
- Key starts with `AIza...`
- Full key is copied (usually 39 characters)

### 4. Billing Not Enabled

**Check:**
- Go to **Billing** in Google Cloud Console
- Ensure billing is enabled (required even for free tier)
- Google provides $200/month credit, so you won't be charged for normal usage

### 5. Environment Variable Not Loading

**For local development:**
- Restart your dev server after adding the key
- Check that `.env.local` is in the project root
- Verify the key is on a single line (no line breaks)

**For Vercel:**
- Ensure the key is set in Vercel environment variables
- Redeploy after adding the key
- Check that it's set for the correct environment (Production/Preview/Development)

## Quick Test Steps

1. **Verify API key in browser console:**
   ```javascript
   // Open browser console and check:
   console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
   // Should show your key (not undefined)
   ```

2. **Test API key directly:**
   - Visit: `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY`
   - Should return JavaScript (not an error)
   - Replace `YOUR_API_KEY` with your actual key

3. **Check browser console for specific error:**
   - Open DevTools → Console
   - Look for detailed error messages
   - Common errors:
     - "RefererNotAllowedMapError" → API key restrictions issue
     - "ApiNotActivatedMapError" → Maps JavaScript API not enabled
     - "InvalidKeyMapError" → API key is invalid

## Debugging Code

Add this temporarily to see what's being passed:

```typescript
// In GoogleMap.tsx, add before return:
console.log('API Key present:', !!apiKey);
console.log('API Key length:', apiKey?.length);
console.log('API Key starts with:', apiKey?.substring(0, 4));
```

## Most Common Fix

**90% of the time, it's one of these:**

1. **Maps JavaScript API not enabled** → Enable it in Google Cloud Console
2. **API key restrictions blocking localhost** → Add `localhost:3000/*` to HTTP referrers
3. **Billing not enabled** → Enable billing in Google Cloud Console
4. **Wrong API key** → Double-check you copied the correct key

## Still Not Working?

1. Create a new API key (unrestricted temporarily) to test
2. Check Google Cloud Console → **APIs & Services** → **Dashboard** for quota/error logs
3. Verify the key works in Google's test page: https://developers.google.com/maps/documentation/javascript/examples/map-simple

