# Remove Duplicate Reviews Script

This script identifies and removes duplicate reviews from the Supabase reviews table.

## What It Does

1. **Fetches all reviews** from the Supabase reviews table
2. **Identifies duplicates** based on:
   - `brewery_id` + `review_timestamp` + `reviewer_name`
3. **Keeps the oldest review** (earliest `created_at`) from each duplicate group
4. **Deletes the rest** of the duplicates

## Prerequisites

- Environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Usage

### Dry Run (Recommended First)

First, run in dry-run mode to see what would be deleted without actually deleting anything:

```bash
npx tsx scripts/remove-duplicate-reviews.ts --dry-run
```

This will show:
- How many duplicate groups were found
- Details about each duplicate group
- Which reviews would be kept vs deleted

### Remove Duplicates

Once you've reviewed the dry-run output, run without the `--dry-run` flag to actually delete duplicates:

```bash
npx tsx scripts/remove-duplicate-reviews.ts
```

## How Duplicates Are Identified

Duplicates are identified by a combination of:
- **Brewery ID**: Which brewery the review is for
- **Review Timestamp**: When the review was posted (from Google)
- **Reviewer Name**: Who wrote the review

If two reviews have the same values for all three fields, they are considered duplicates.

## Which Review Is Kept?

For each group of duplicates, the script keeps the review with the **earliest `created_at`** timestamp (the one that was inserted into the database first). All other duplicates are deleted.

## Output

The script provides detailed logging:
- Total number of reviews fetched
- Number of duplicate groups found
- Summary statistics (total duplicates, reviews to keep, reviews to delete)
- Progress during deletion
- Final summary

## Example Output

```
📥 Fetching all reviews from Supabase...
   ✓ Fetched 1250 reviews

🔍 Searching for duplicate reviews...

📊 Found 15 groups of duplicate reviews

📈 Summary:
   - Total duplicate groups: 15
   - Total duplicate reviews: 45
   - Reviews to keep: 15
   - Reviews to delete: 30

🗑️  Deleting duplicate reviews...

   ✓ Deleted batch 1 (30 reviews)

📊 Final Summary:
   - Duplicate groups found: 15
   - Reviews deleted: 30
   - Reviews kept: 15

✅ Duplicate removal complete!
```

## Safety

- The script uses the Supabase admin client (service role key) to ensure it has permission to delete reviews
- Duplicates are deleted in batches to avoid overwhelming the database
- The dry-run mode allows you to preview changes before making them

## Troubleshooting

### "Supabase admin client not available"

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env.local` file.

### "Failed to fetch reviews"

Check that `NEXT_PUBLIC_SUPABASE_URL` is correct and that your Supabase project is accessible.

### No duplicates found

If the script reports no duplicates, it means all reviews in your database are unique based on the criteria (brewery_id + review_timestamp + reviewer_name).

