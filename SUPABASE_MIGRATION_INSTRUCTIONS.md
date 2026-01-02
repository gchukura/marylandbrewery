# Supabase Migration Instructions

## Option 1: Run Migration via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/cslbsgdjuftrxhigfrru/sql/new
2. Copy the entire contents of: `supabase/migrations/20251231201146_create_attractions_table.sql`
3. Paste into the SQL editor
4. Click "Run" to execute the migration

## Option 2: Use Supabase CLI (Requires Login)

### Step 1: Login to Supabase CLI
```bash
npx supabase login
```
This will open a browser for authentication.

### Step 2: Link to Your Remote Project
```bash
npx supabase link --project-ref cslbsgdjuftrxhigfrru
```
You'll be prompted for your database password (found in Supabase Dashboard → Settings → Database).

### Step 3: Push Migration to Remote
```bash
npx supabase db push
```

## Option 3: Use Direct Database Connection

If you have the database connection string, you can use `psql` or any PostgreSQL client:

1. Get your database connection string from: Supabase Dashboard → Settings → Database → Connection string (URI)
2. Run the migration SQL file directly:
```bash
psql "your-connection-string" -f supabase/migrations/20251231201146_create_attractions_table.sql
```

## Verify Migration

After running the migration, verify it worked:

1. Go to: https://supabase.com/dashboard/project/cslbsgdjuftrxhigfrru/editor
2. Check if the `maryland_attractions` table exists
3. Verify the `get_nearby_attractions` function exists in the Functions section

