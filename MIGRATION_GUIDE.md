# Migration Guide: Google Sheets to Supabase

This guide will help you migrate your Maryland Brewery Directory from Google Sheets to Supabase.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com) if you don't have one
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Environment Variables**: You'll need your Supabase credentials

## Step 1: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `lib/supabase-schema.sql` and copy its contents
4. Paste and run the SQL in the Supabase SQL Editor
5. This will create:
   - `breweries` table
   - `beers` table
   - `newsletter_subscribers` table
   - Indexes for performance
   - Row Level Security (RLS) policies

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (this is your `SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

## Step 3: Set Environment Variables

Add these to your `.env.local` file (or your deployment environment):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep Google Sheets credentials for migration (can remove after migration)
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
```

## Step 4: Run the Migration Script

The migration script will:
1. Fetch all data from Google Sheets
2. Transform it to match the Supabase schema
3. Insert it into Supabase

### Option A: Using tsx (Recommended)

First, install tsx if you haven't already:
```bash
npm install -D tsx
```

Then run the migration:
```bash
npx tsx scripts/migrate-to-supabase.ts
```

### Option B: Using ts-node

```bash
npm install -D ts-node
npx ts-node scripts/migrate-to-supabase.ts
```

### Option C: Compile and Run

```bash
npx tsc scripts/migrate-to-supabase.ts --esModuleInterop --module commonjs --target es2020
node scripts/migrate-to-supabase.js
```

## Step 5: Verify Migration

1. Check your Supabase dashboard → **Table Editor**
2. Verify that:
   - All breweries are in the `breweries` table
   - All beers are in the `beers` table
   - Counts match your Google Sheets data

## Step 6: Test Your Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the following:
   - Home page loads breweries
   - Individual brewery pages work
   - Search functionality
   - Newsletter signup
   - API endpoints (`/api/breweries`)

## Step 7: Deploy

1. **Add the Supabase environment variables to Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/public key
     - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (for admin operations)
   - Make sure to add them for **Production**, **Preview**, and **Development** environments
   - Click **Save** and redeploy your application

2. Deploy your application
3. Test in production

**Important:** The build will fail if these environment variables are not set, as Next.js tries to fetch data from Supabase during the build process for static page generation.

## Step 8: Clean Up (Optional)

Once you've verified everything works:

1. You can remove Google Sheets credentials from your environment variables
2. The `lib/google-sheets.ts` file can be kept for reference or removed
3. Consider archiving your Google Sheet as a backup

## Troubleshooting

### Migration Script Errors

- **"Missing Supabase environment variables"**: Make sure all three Supabase env vars are set
- **"Failed to fetch breweries"**: Check your Google Sheets credentials
- **"Error inserting breweries"**: Verify the schema was created correctly in Supabase

### Application Errors

- **"Missing Supabase environment variables"**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- **"Row Level Security policy violation"**: Check that RLS policies are set up correctly (see schema file)
- **Empty data**: Verify the migration completed successfully

### Performance Issues

- The migration script inserts data in batches of 100
- For large datasets, you may need to increase the batch size or run in smaller chunks
- Supabase has rate limits on the free tier - if you hit limits, wait a few minutes and retry

## Rollback Plan

If you need to rollback:

1. Your Google Sheets data is still intact (migration only reads, doesn't modify)
2. You can temporarily switch back by:
   - Reverting the import in `lib/brewery-data.ts` to use `getBreweryDataFromSheets`
   - Reverting the newsletter route to use `addNewsletterSubscriber` from `google-sheets.ts`

## Next Steps

After successful migration:

1. **Optimize Queries**: Consider using Supabase's PostGIS features for location-based queries
2. **Add Real-time**: Enable real-time subscriptions if you need live updates
3. **Set Up Backups**: Configure Supabase backups in your dashboard
4. **Monitor Performance**: Use Supabase dashboard to monitor query performance

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review the migration script output for specific errors
3. Verify all environment variables are set correctly

