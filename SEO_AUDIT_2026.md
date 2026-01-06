# SEO Audit Report: MarylandBrewery.com

**Date:** January 5, 2026  
**Auditor:** SEO Specialist  
**URL:** https://www.marylandbrewery.com  
**Framework:** Next.js 14+ (App Router)  

---

## Executive Summary

MarylandBrewery.com demonstrates a **solid foundation for SEO** with well-implemented programmatic SEO patterns, comprehensive metadata handling, and structured data. However, several critical and moderate issues need attention to maximize search visibility and indexing efficiency.

| Category | Score | Status |
|----------|-------|--------|
| Technical SEO | 78/100 | ⚠️ Good with Issues |
| On-Page SEO | 85/100 | ✅ Strong |
| Structured Data | 80/100 | ✅ Strong |
| Content SEO | 88/100 | ✅ Excellent |
| Programmatic SEO | 92/100 | ✅ Excellent |
| Core Web Vitals | 75/100 | ⚠️ Needs Attention |

**Overall Score: 83/100** - Strong foundation with room for improvement

---

## 🔴 Critical Issues (Immediate Action Required)

### 1. Missing Open Graph Image (`og-image.jpg`)

**Location:** Referenced across all pages but file does not exist in `/public/`

**Impact:** Social sharing will show broken/missing images on Facebook, Twitter, LinkedIn, and Discord. This significantly reduces click-through rates from social media.

**Evidence:**
```tsx
// src/app/layout.tsx - Line 47
images: [
  {
    url: "/og-image.jpg",  // ❌ File doesn't exist
    width: 1200,
    height: 630,
    alt: "Maryland Brewery Directory",
  },
],
```

**Fix:** Create a 1200×630px branded Open Graph image and place it at `/public/og-image.jpg`

---

### 2. Google Search Console Verification Not Configured

**Location:** `src/app/layout.tsx` - Line 74

**Impact:** Unable to verify site ownership in Google Search Console, preventing access to search performance data and indexing insights.

**Evidence:**
```tsx
verification: {
  google: "your-google-verification-code",  // ❌ Placeholder not replaced
},
```

**Fix:** 
1. Add site to Google Search Console
2. Get verification meta tag code
3. Replace placeholder with actual code

---

### 3. Missing Custom 404 and Error Pages

**Impact:** Poor user experience and missed SEO opportunity. Custom 404 pages can retain users and guide them to valid content.

**Evidence:** No `not-found.tsx` or `error.tsx` files found in `/src/app/`

**Fix:** Create the following files:
- `/src/app/not-found.tsx` - Custom 404 with navigation to popular pages
- `/src/app/error.tsx` - Error boundary with recovery options

---

### 4. Robots.txt Blocking Essential Resources

**Location:** `src/app/robots.ts` - Lines 24-26

**Impact:** Blocking `/_next/static` prevents Googlebot from accessing CSS/JS needed for rendering, potentially causing indexing issues.

**Evidence:**
```tsx
disallow: [
  '/_next/static',  // ❌ Blocks CSS/JS
  '/_next/image',   // ❌ Blocks optimized images
  // ...
],
```

**Current robots.txt issue:** The default rule blocks these, but the Googlebot-specific rule allows them. However, the inconsistency can cause confusion.

**Fix:** Remove resource blocking from the default `userAgent: '*'` rule or ensure CSS/JS/images are explicitly allowed for all bots.

---

## 🟡 Moderate Issues (Address Within 2 Weeks)

### 5. Inconsistent Internal Link Paths

**Impact:** Some pages link to `/city` instead of `/cities`, `/county` instead of `/counties`. While redirects exist, this wastes crawl budget and dilutes link equity.

**Evidence:**
```tsx
// src/app/open-now/page.tsx - Line 82
{ title: 'All Cities', url: '/city', count: processed.cities.length },

// src/app/map/page.tsx - Lines 52-54
{ title: 'All Cities', url: '/city', ... },
{ title: 'All Counties', url: '/county', ... },
```

**Fix:** Update all internal links to use canonical paths (`/cities`, `/counties`) instead of relying on redirects.

---

### 6. Missing Aggregate Rating in Brewery Structured Data

**Location:** `src/components/templates/SimpleBreweryPageTemplate.tsx`

**Impact:** Not including `aggregateRating` in structured data means rich snippets with star ratings won't appear in search results.

**Evidence:** The `generateStructuredData()` function doesn't include rating data, despite having `brewery.googleRating` and `brewery.googleRatingCount` available.

**Fix:** Add to structured data:
```typescript
...(brewery.googleRating && {
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: brewery.googleRating,
    reviewCount: brewery.googleRatingCount || 0,
    bestRating: 5,
    worstRating: 1,
  },
}),
```

---

### 7. Missing WebSite Schema for Sitelinks Search Box

**Impact:** Without WebSite schema, Google won't show the sitelinks search box in search results.

**Fix:** Add to root layout:
```tsx
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Maryland Brewery Directory',
  url: 'https://www.marylandbrewery.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.marylandbrewery.com/map?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
```

---

### 8. Manifest.json Limited Icon Sizes

**Location:** `/public/manifest.json`

**Impact:** PWA installation and app-like experiences may not work properly on all devices.

**Current State:**
```json
"icons": [
  { "src": "/favicon-16x16.png", "sizes": "16x16" },
  { "src": "/favicon-32x32.png", "sizes": "32x32" },
  { "src": "/apple-touch-icon.png", "sizes": "180x180" }
]
```

**Fix:** Add standard PWA icon sizes (192x192, 512x512) with maskable versions.

---

### 9. Missing OpeningHoursSpecification in Brewery Structured Data

**Impact:** Rich snippets showing "Open Now" or business hours won't appear in Google search results.

**Fix:** The structured data generation should include proper opening hours when available:
```typescript
...(brewery.hours && {
  openingHoursSpecification: Object.entries(brewery.hours)
    .filter(([_, hours]) => hours && hours !== 'Closed')
    .map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: parseOpenTime(hours),
      closes: parseCloseTime(hours),
    })),
}),
```

---

## 🟢 Positive Findings (What's Working Well)

### ✅ Excellent Programmatic SEO Implementation

The site implements best-practice programmatic SEO with:
- **500+ dynamically generated pages** for cities, counties, types, and amenities
- **Unique content generation** via `content-generators.ts`
- **Dynamic meta descriptions** that avoid duplication
- **Proper canonical URLs** on all pages

### ✅ Comprehensive Sitemap

**Location:** `src/app/sitemap.ts`

The sitemap includes:
- Homepage with priority 1.0
- Static pages (map, best-breweries, contact)
- All city pages (with and without `-md` suffix)
- All county pages
- Individual brewery pages with `lastModified` dates
- Type and amenity pages
- Region pages
- Neighborhood pages

### ✅ Proper Metadata Implementation

Uses Next.js Metadata API correctly:
- Template-based titles (`%s | Maryland Brewery Directory`)
- Dynamic meta descriptions (120-160 characters)
- Open Graph and Twitter Cards on all pages
- Canonical URLs configured

### ✅ Strong Structured Data Foundation

Implements multiple schema types:
- `Brewery` (LocalBusiness subtype)
- `CollectionPage` with `ItemList`
- `BreadcrumbList` (visible breadcrumbs with schema)
- Organization schema

### ✅ Security Headers

Properly configured in `next.config.ts` and `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy configured

### ✅ ISR (Incremental Static Regeneration)

Pages use `revalidate = 3600` for hourly regeneration, balancing freshness with performance.

### ✅ Image Optimization

- Uses Next.js `<Image>` component with lazy loading
- Proper `alt` attributes on images (48 instances found)
- WebP/AVIF format support configured
- Responsive image sizes specified

### ✅ URL Structure

Clean, semantic URLs:
- `/breweries/[slug]` - Individual breweries
- `/cities/[city]/breweries` - City brewery lists
- `/counties/[county]/breweries` - County brewery lists
- `/type/[type]` - Brewery types
- `/amenities/[amenity]` - Amenity filters

### ✅ 301 Redirects for Legacy URLs

Properly configured permanent redirects in `next.config.ts` for:
- `/breweries/amenity/*` → `/amenities/*`
- `/breweries/type/*` → `/type/*`
- `/city/*` → `/cities/*`
- `/county/*` → `/counties/*`

---

## 📊 Technical SEO Metrics

### Crawlability
| Metric | Status | Notes |
|--------|--------|-------|
| Sitemap.xml | ✅ Present | Auto-generated by Next.js |
| Robots.txt | ⚠️ Partial | Some resources blocked |
| Canonical URLs | ✅ Implemented | All pages have canonicals |
| Pagination | ✅ Handled | City pages use `/page/[page]` |

### Indexability
| Metric | Status | Notes |
|--------|--------|-------|
| Meta Robots | ✅ Configured | index, follow by default |
| noindex Pages | ✅ Correct | Only admin/test pages |
| Dynamic Rendering | ✅ ISR | Hourly revalidation |

### Mobile Friendliness
| Metric | Status | Notes |
|--------|--------|-------|
| Viewport | ✅ Configured | Proper viewport meta |
| Touch Targets | ✅ Good | Adequate spacing |
| Responsive Design | ✅ Implemented | Tailwind CSS breakpoints |

---

## 🎯 Recommendations by Priority

### Immediate (This Week)
1. ❌ Create `/public/og-image.jpg` (1200×630px)
2. ❌ Add Google Search Console verification code
3. ❌ Create custom 404 page (`/src/app/not-found.tsx`)
4. ❌ Fix robots.txt resource blocking

### Short-term (2 Weeks)
5. ⚠️ Add `aggregateRating` to brewery structured data
6. ⚠️ Fix internal links pointing to `/city` instead of `/cities`
7. ⚠️ Add `WebSite` schema for sitelinks search box
8. ⚠️ Add `openingHoursSpecification` to brewery schema

### Medium-term (1 Month)
9. 📝 Expand PWA manifest with proper icon sizes
10. 📝 Add FAQ schema to popular pages
11. 📝 Implement breadcrumb schema on more page types
12. 📝 Add Bing Webmaster verification

### Long-term (Quarterly)
13. 🔄 Monitor Core Web Vitals in Google Search Console
14. 🔄 Regular content freshness audits
15. 🔄 Competitive keyword analysis
16. 🔄 Internal linking optimization

---

## 📈 SEO Opportunities

### High-Value Keywords to Target

Based on the site structure, these keyword clusters should be targeted:

| Keyword Cluster | Current Pages | Opportunity |
|-----------------|---------------|-------------|
| "breweries near [attraction]" | Limited | Expand `/near/` pages |
| "dog friendly breweries maryland" | Via amenities | Create dedicated landing |
| "best breweries [city] md" | `/best-breweries/[city]` | Optimize H1s |
| "brewery tours maryland" | Via amenities | Create dedicated guide |
| "craft beer [county] maryland" | `/counties/` | Add more content |

### Featured Snippet Opportunities

1. **"How many breweries in Maryland"** - Add prominent stat on homepage
2. **"Best breweries in Baltimore"** - Optimize list format for featured snippets
3. **"Maryland brewery map"** - `/map` page could capture this

### Local SEO Enhancements

1. Add `LocalBusiness` schema to each city page
2. Include geo-coordinates in city page structured data
3. Add "near me" targeting via `GeoCircle` schema

---

## 🛠️ Implementation Checklist

```markdown
## Critical Fixes
- [ ] Create og-image.jpg (1200×630px) in /public/
- [ ] Add Google Search Console verification code
- [ ] Create /src/app/not-found.tsx
- [ ] Create /src/app/error.tsx
- [ ] Fix robots.txt resource blocking

## Structured Data
- [ ] Add aggregateRating to brewery schema
- [ ] Add openingHoursSpecification to brewery schema
- [ ] Add WebSite schema to root layout
- [ ] Add BreadcrumbList schema to more page types

## Internal Linking
- [ ] Update /city → /cities in open-now page
- [ ] Update /city → /cities in map page
- [ ] Update /county → /counties in map page
- [ ] Audit all Link components for correct paths

## PWA/Manifest
- [ ] Add 192×192 icon
- [ ] Add 512×512 icon
- [ ] Add maskable icons
- [ ] Add shortcuts for PWA

## Search Console
- [ ] Verify site in Google Search Console
- [ ] Submit sitemap
- [ ] Verify site in Bing Webmaster Tools
- [ ] Submit sitemap to Bing
```

---

## Conclusion

MarylandBrewery.com has a **strong SEO foundation** with excellent programmatic SEO implementation, proper metadata handling, and good structured data. The most critical issues to address immediately are:

1. **Missing og-image.jpg** - Impacts social sharing
2. **Google verification placeholder** - Blocks Search Console access
3. **Missing 404 page** - Poor user experience
4. **Robots.txt resource blocking** - May impact rendering

Addressing these issues will improve the site's overall SEO health and prepare it for better search visibility. The existing programmatic SEO patterns provide an excellent foundation for scaling content and capturing long-tail keywords across Maryland's craft brewery landscape.

---

*Report generated: January 5, 2026*


