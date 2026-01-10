# Build Instructions - Preventing CSS Cache Issues

## Problem
When making CSS/styling changes, the browser may request old CSS files that no longer exist, causing "stylesheet failed to load" errors. This happens because Next.js generates static HTML files with CSS file hashes, and these can become stale.

## Solution: Always Clean Build

**Before building, always clear the build cache:**

```bash
# Option 1: Use the clean build script (RECOMMENDED)
npm run build:clean

# Option 2: Clean build and start in one command
npm run start:clean

# Option 3: Manual clean
rm -rf .next && npm run build && npm start
```

## Development Workflow

1. **Make your changes** to CSS/styling files
2. **Stop the server** (Ctrl+C)
3. **Clean and rebuild:**
   ```bash
   npm run build:clean
   npm start
   ```
4. **Hard refresh browser** (Cmd+Shift+R / Ctrl+Shift+R)

## Why This Happens

Next.js statically generates pages with CSS file references. When CSS changes:
- New CSS files are generated with new hashes
- Old HTML files may still reference old CSS hashes
- Browser/server caches may serve stale HTML
- Browser tries to load old CSS files → 404 error

## Prevention

The `next.config.ts` now includes:
- **Cache-Control headers** that prevent HTML caching (`no-store, no-cache`)
- This forces browsers and proxies to always fetch fresh HTML
- CSS file references will always match the current build

## Important Notes

- **Always use `npm run build:clean`** instead of `npm run build` after CSS changes
- The cache headers prevent HTML caching, but you still need to clean `.next` before rebuilding
- Hard refresh your browser after each rebuild (Cmd+Shift+R / Ctrl+Shift+R)

