# Test Route for Enhanced Brewery Detail Page

## Overview

A test route has been created to allow you to iterate on the enhanced brewery detail page without affecting the production version.

## Test Route Location

**Test URL Pattern:** `/breweries/[slug]/test`

**Example:** 
- Production: `http://localhost:3000/breweries/1623-brewing-company`
- Test: `http://localhost:3000/breweries/1623-brewing-company/test`

## Files Created

1. **`src/app/breweries/[slug]/test/page.tsx`**
   - Test route page component
   - Includes computed values (city/state ratings, same city/county counts, etc.)
   - Uses `SimpleBreweryPageTemplateV2` component

2. **`src/components/templates/SimpleBreweryPageTemplateV2.tsx`**
   - Copy of the original template
   - Ready to be enhanced with the prompts from `Cursor_Prompts_Brewery_Detail_Page.md`
   - Accepts a `computed` prop for enhanced features

## How to Use

### 1. Start Development Server

```bash
npm run dev
```

### 2. Access Test Route

Visit any brewery page with `/test` appended:
- `http://localhost:3000/breweries/[any-brewery-slug]/test`

### 3. Implement Enhancements

Follow the prompts in `Cursor_Prompts_Brewery_Detail_Page.md` sequentially:

1. **Prompt 1**: Already implemented - computed values are calculated and passed to template
2. **Prompt 2**: Enhanced meta description generator
3. **Prompt 3**: Type-specific content generator
4. **Prompt 4**: Atmosphere content generator
5. **Prompt 5**: Update About section
6. **Prompt 6**: Enhanced hours section
7. **Prompt 7**: Categorized amenities component
8. **Prompt 8**: Rating context component
9. **Prompt 9**: Enhanced related links
10. **Prompt 10**: Enhanced structured data
11. **Prompt 11**: Final integration check

### 4. Test Incrementally

- Implement one prompt at a time
- Test the changes in the browser
- Iterate and refine before moving to the next prompt

### 5. When Ready for Production

Once you're satisfied with the enhanced version:

1. **Option A**: Replace the original template
   - Copy `SimpleBreweryPageTemplateV2.tsx` → `SimpleBreweryPageTemplate.tsx`
   - Update `src/app/breweries/[slug]/page.tsx` to include computed values
   - Delete the test route

2. **Option B**: Gradual rollout with feature flag
   - Add environment variable `NEXT_PUBLIC_ENHANCED_BREWERY_PAGE=true`
   - Conditionally use V2 template in production route

## Current Status

✅ Test route created and functional
✅ Computed values calculated and passed to template
✅ Template accepts `computed` prop
⏳ Ready for enhancement implementation

## Safety

- **Production routes are completely unaffected** - `/breweries/[slug]` still uses the original template
- **Test route is isolated** - Only accessible via `/breweries/[slug]/test`
- **No database changes** - All enhancements are frontend-only
- **Easy rollback** - Just delete the test route if needed

## Next Steps

1. Review `Cursor_Prompts_Brewery_Detail_Page.md`
2. Start implementing Prompt 2 (Enhanced Meta Description Generator)
3. Test each enhancement in the browser
4. Iterate until satisfied
5. Deploy when ready

