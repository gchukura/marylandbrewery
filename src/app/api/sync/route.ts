import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getBreweryDataFromSupabase } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-auth';

/**
 * Refresh the site after a data change. Called by .github/workflows/sync.yml with the
 * x-admin-token header. Every cached brewery query is tagged 'brewery-data'; dropping that
 * tag and revalidating the root layout makes every page re-read Supabase on its next request.
 */
export async function POST(req: Request) {
  const startedAt = Date.now();
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read uncached first: if Supabase fails or comes back empty, keep the current cache
    const breweries = await getBreweryDataFromSupabase();
    if (breweries.length === 0) {
      return NextResponse.json({ ok: false, error: 'Supabase returned no breweries; cache kept' }, { status: 502 });
    }

    revalidateTag('brewery-data');
    revalidatePath('/', 'layout');

    const result = {
      ok: true,
      breweryCount: breweries.length,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    };
    console.log('[SYNC] completed', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[SYNC] failed', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
