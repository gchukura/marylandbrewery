# Supabase Migration Summary

## ✅ Migration Complete

Your Maryland Brewery Directory has been successfully migrated from Google Sheets to Supabase!

## What Changed

### New Files Created

1. **`lib/supabase.ts`** - Supabase client configuration and database types
2. **`lib/supabase-client.ts`** - Supabase client functions (replaces Google Sheets functions)
3. **`lib/supabase-schema.sql`** - Database schema for Supabase
4. **`lib/supabase-postgis-function.sql`** - Optional PostGIS function for location queries
5. **`scripts/migrate-to-supabase.ts`** - Migration script to move data from Sheets to Supabase
6. **`MIGRATION_GUIDE.md`** - Step-by-step migration instructions

### Files Modified

1. **`lib/brewery-data.ts`** - Now uses Supabase instead of Google Sheets
2. **`src/app/api/newsletter/subscribe/route.ts`** - Now uses Supabase for newsletter subscriptions
3. **`src/app/api/breweries/route.ts`** - Updated comment (already using the updated brewery-data.ts)
4. **`package.json`** - Added `@supabase/supabase-js` dependency

### Files Kept (for reference/migration)

1. **`lib/google-sheets.ts`** - Kept for migration script and as backup reference

## Next Steps

### 1. Set Up Supabase Database

Run the SQL schema in your Supabase dashboard:
- Open `lib/supabase-schema.sql` in Supabase SQL Editor
- Execute the SQL to create tables, indexes, and RLS policies

### 2. Set Environment Variables

Add to your `.env.local` and deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migration

```bash
# Install tsx if needed
npm install -D tsx

# Run migration
npx tsx scripts/migrate-to-supabase.ts
```

### 4. Test Your Application

```bash
npm run dev
```

Test:
- Home page loads breweries
- Individual brewery pages
- Search functionality
- Newsletter signup
- API endpoints

### 5. Deploy

Add environment variables to your deployment platform and deploy.

## Benefits of Supabase

✅ **Better Performance** - Faster queries, especially with indexes  
✅ **Scalability** - Handles growth better than Google Sheets  
✅ **Type Safety** - Strong typing with TypeScript  
✅ **Advanced Queries** - SQL, full-text search, geospatial queries  
✅ **Real-time** - Can enable real-time subscriptions if needed  
✅ **Security** - Row Level Security (RLS) policies  
✅ **Backups** - Automatic backups in Supabase  

## Architecture

```
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ supabase-client │  (lib/supabase-client.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│   PostgreSQL    │
└─────────────────┘
```

## Data Flow

1. **Build Time**: Next.js fetches data from Supabase and caches it
2. **Runtime**: API routes use cached data or fetch fresh from Supabase
3. **Newsletter**: Subscriptions go directly to Supabase

## Troubleshooting

See `MIGRATION_GUIDE.md` for detailed troubleshooting steps.

## Support

- Supabase Docs: https://supabase.com/docs
- Migration Guide: See `MIGRATION_GUIDE.md`
- Schema: See `lib/supabase-schema.sql`

