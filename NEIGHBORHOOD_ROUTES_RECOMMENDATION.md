# Neighborhood Routes Implementation Recommendation

## Overview
Implement two new routes for neighborhood-based brewery pages:
1. `/best-breweries/near/[neighborhood]-[cityName]-md/` - Breweries within 10 miles of neighborhood
2. `/best-breweries/[neighborhood]-[cityName]-md/` - Best breweries in/around neighborhood

## Slug Pattern
- Format: `[neighborhood-slug]-[city-slug]-md`
- Example: `edgemoor-bethesda-md`, `harbor-east-baltimore-md`
- Must have 3+ parts and end with `-md`

## Key Design Decisions

### 1. Route Priority & Conflict Prevention
**Problem**: Need to avoid conflicts with existing routes:
- `/best-breweries/near/[city]/` - handles 1-2 word city slugs
- `/best-breweries/near/[city]-md/` - handles city slugs with -md
- `/best-breweries/[slug]/` - handles cities, counties, regions

**Solution**: 
- New routes should ONLY match slugs with 3+ parts ending in `-md`
- Use strict validation: `parts.length >= 3 && slug.endsWith('-md')`
- Check that it's NOT a city slug (city slugs are 1-2 words)

### 2. Slug Parsing Strategy
**Leverage Enriched Data**: Now that neighborhoods have `city` field populated:
1. Parse slug: `[neighborhood]-[city]-md`
2. Extract city slug (last part before `-md`)
3. Get all neighborhoods for that city
4. Find neighborhood by matching slug prefix
5. Verify `neighborhood.city` matches parsed city name

**Example**:
- Slug: `edgemoor-bethesda-md`
- City slug: `bethesda` → City name: `Bethesda`
- Get neighborhoods in Bethesda
- Find neighborhood with slug `edgemoor`
- Verify `neighborhood.city === 'Bethesda'`

### 3. File Structure
```
src/app/best-breweries/
├── near/
│   ├── [city]/
│   ├── [city]-md/
│   └── [neighborhood]-[city]-md/  ← NEW
└── [neighborhood]-[city]-md/      ← NEW
```

**Note**: Next.js dynamic routes use `[...slug]` or specific patterns. For `[neighborhood]-[city]-md`, we need a catch-all or specific pattern matching.

**Recommended Approach**: Use a catch-all route `[...slug]` with validation, OR create specific route files that match the pattern.

### 4. Implementation Approach

#### Option A: Catch-All Route with Validation (Recommended)
Create:
- `/best-breweries/near/[...slug]/page.tsx` - handles both city and neighborhood
- `/best-breweries/[...slug]/page.tsx` - handles city, county, region, and neighborhood

**Pros**: 
- Flexible, handles any slug pattern
- Single file to maintain
- Easy to add new patterns

**Cons**:
- More complex validation logic
- Need to ensure proper route priority

#### Option B: Specific Route Files (More Explicit)
Create:
- `/best-breweries/near/[neighborhood]-[city]-md/page.tsx`
- `/best-breweries/[neighborhood]-[city]-md/page.tsx`

**Pros**:
- Clear, explicit routes
- Easier to understand
- Better TypeScript types

**Cons**:
- Next.js doesn't support this pattern directly (would need `[...slug]`)

#### Option C: Hybrid Approach (Recommended)
Modify existing catch-all routes to handle neighborhoods:
- Update `/best-breweries/near/[city]/page.tsx` to also handle neighborhood slugs
- Update `/best-breweries/[slug]/page.tsx` to also handle neighborhood slugs

**Validation Logic**:
```typescript
function isNeighborhoodSlug(slug: string): boolean {
  const parts = slug.split('-');
  // Must have 3+ parts and end with -md
  return parts.length >= 3 && slug.endsWith('-md');
}

function isCitySlug(slug: string): boolean {
  const parts = slug.split('-');
  const slugWithoutMd = slug.endsWith('-md') ? slug.substring(0, slug.length - 3) : slug;
  const partsWithoutMd = slugWithoutMd.split('-');
  // City slugs are 1-2 words
  return partsWithoutMd.length <= 2;
}
```

## Recommended Implementation Plan

### Step 1: Create Helper Functions
Create a shared utility file for neighborhood slug parsing:
- `parseNeighborhoodSlug(slug: string)` - parses and validates neighborhood slugs
- Uses enriched `city` field to verify matches
- Returns `{ neighborhood, cityName, citySlug }` or `null`

### Step 2: Update Existing Routes
Modify:
- `/best-breweries/near/[city]/page.tsx` - add neighborhood handling
- `/best-breweries/[slug]/page.tsx` - add neighborhood handling

**Route Priority**:
1. Check if it's a city slug → handle as city
2. Check if it's a neighborhood slug → handle as neighborhood
3. Otherwise → not found

### Step 3: Neighborhood-Specific Logic
For neighborhood routes:
- Use `neighborhood.latitude/longitude` for distance calculations
- Filter breweries within 10 miles (for `/near/` route)
- Filter breweries in same city (for non-`/near/` route)
- Calculate brewery scores and sort
- Display neighborhood name and city in page title

### Step 4: Testing
- Test with various neighborhood slugs
- Verify no conflicts with city routes
- Test edge cases (neighborhoods with same name in different cities)

## Code Structure

### Helper Function (shared utility)
```typescript
// lib/neighborhood-utils.ts
export async function parseNeighborhoodSlug(
  slug: string
): Promise<{ neighborhood: DatabaseNeighborhood; cityName: string; citySlug: string } | null> {
  // Validation: must have 3+ parts and end with -md
  const parts = slug.split('-');
  if (parts.length < 3 || !slug.endsWith('-md')) {
    return null;
  }
  
  // Extract city slug (last part before -md)
  const citySlug = parts[parts.length - 2];
  const cityName = deslugify(citySlug);
  
  // Get neighborhoods for this city
  const cityNeighborhoods = await getNeighborhoodsByCity(cityName);
  
  // Extract neighborhood slug (everything before city-slug-md)
  const neighborhoodSlug = parts.slice(0, -2).join('-');
  
  // Find matching neighborhood
  const neighborhood = cityNeighborhoods.find(
    n => n.slug === neighborhoodSlug && 
         n.city?.toLowerCase() === cityName.toLowerCase()
  );
  
  if (!neighborhood) {
    return null;
  }
  
  return { neighborhood, cityName, citySlug };
}
```

### Route Handler Pattern
```typescript
// In route file
const resolvedParams = await params;
const slug = resolvedParams?.slug || resolvedParams?.city;

// Check if it's a neighborhood slug first
const neighborhoodData = await parseNeighborhoodSlug(slug);
if (neighborhoodData) {
  // Handle as neighborhood
  return <NeighborhoodPage {...neighborhoodData} />;
}

// Otherwise, check if it's a city slug
if (isCitySlug(slug)) {
  // Handle as city
  return <CityPage city={slug} />;
}

// Not found
notFound();
```

## Benefits of This Approach

1. **No Breaking Changes**: Existing routes continue to work
2. **Leverages Enriched Data**: Uses the newly populated `city` field
3. **Type Safe**: Clear validation and error handling
4. **Maintainable**: Shared utility functions
5. **SEO Friendly**: Proper metadata and URLs
6. **Scalable**: Easy to add more neighborhood patterns

## Potential Issues & Solutions

### Issue 1: Ambiguous Slugs
**Problem**: What if a neighborhood name matches a city name?
**Solution**: Always check city slug first, then neighborhood. City routes take priority.

### Issue 2: Missing Coordinates
**Problem**: Some neighborhoods might not have lat/lng
**Solution**: Fallback to city-based filtering or show city breweries.

### Issue 3: Route Conflicts
**Problem**: Next.js route matching might conflict
**Solution**: Use explicit validation and `notFound()` for invalid patterns.

## Next Steps

1. Create `lib/neighborhood-utils.ts` with parsing functions
2. Update `/best-breweries/near/[city]/page.tsx` to handle neighborhoods
3. Update `/best-breweries/[slug]/page.tsx` to handle neighborhoods
4. Test with real neighborhood slugs
5. Add proper metadata and SEO

