# Fixing API Key Restrictions for Server-Side Scripts

## Problem
You're seeing this error:
```
API request denied: API keys with referer restrictions cannot be used with this API.
```

This happens because your Google Maps API key is restricted to only work from specific website domains (referer restrictions), but server-side scripts don't send referer headers.

## Solution: Create a Separate API Key for Server-Side Use

### Option 1: Create a New API Key (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to APIs & Services → Credentials**
   - Click "Create Credentials" → "API Key"

3. **Configure the New API Key**
   - Click on the newly created API key to edit it
   - **Name**: Give it a descriptive name like "Server-Side API Key" or "Scripts API Key"
   - **Application restrictions**: Select **"None"** (for server-side scripts)
   - **API restrictions**: Select "Restrict key"
   - **Select APIs**: Choose only:
     - ✅ Places API (Text Search)
     - ✅ Places API (Place Details)
   - Click "Save"

4. **Update Your Environment Variables**
   - Add the new API key to your `.env.local`:
   ```bash
   # Keep your existing public key for frontend
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_public_key_with_referer_restrictions
   
   # Add new server-side key (this one will be used by scripts)
   GOOGLE_MAPS_API_KEY=your_new_server_side_key_without_restrictions
   ```

5. **Update the Script**
   - The script already checks for `GOOGLE_MAPS_API_KEY` first, then falls back to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - So it should automatically use the new key!

### Option 2: Update Existing API Key (Less Secure)

⚠️ **Not Recommended** - This makes your API key less secure

1. **Go to Google Cloud Console → APIs & Services → Credentials**
2. **Click on your existing API key**
3. **Under "Application restrictions"**: Change from "HTTP referrers" to **"None"**
4. **Save**

⚠️ **Warning**: This removes referer restrictions, making your key usable from anywhere. Only do this if you're okay with reduced security.

## Why This Happens

- **Referer restrictions** are great for frontend/website use (prevents unauthorized usage)
- **Server-side scripts** don't send referer headers, so they can't use referer-restricted keys
- **Solution**: Use separate keys for different use cases:
  - Public key (with referer restrictions) → Frontend/website
  - Server-side key (no restrictions, but API-limited) → Scripts

## Security Best Practices

1. ✅ **Use separate API keys** for different purposes
2. ✅ **Restrict server-side keys** by API (only enable needed APIs)
3. ✅ **Monitor API usage** in Google Cloud Console
4. ✅ **Set up billing alerts** to avoid unexpected charges
5. ✅ **Rotate keys** periodically

## Verify It Works

After updating your API key, run the script again:
```bash
npx tsx scripts/fetch-google-reviews.ts
```

You should no longer see the "referer restrictions" error.

