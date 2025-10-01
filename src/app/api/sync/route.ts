import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getProcessedBreweryData } from '../../../../lib/brewery-data';

const SYNC_TIMEOUT_MS = 60_000;

function getAdminTokenFromRequest(req: Request): string | null {
  const header = req.headers.get('x-admin-token');
  if (header) return header;
  // Fallback: read from JSON body if provided
  return null;
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const token = getAdminTokenFromRequest(req) || process.env.ADMIN_SYNC_TOKEN || '';
    const provided = req.headers.get('x-admin-token') || '';
    if (!token || provided !== token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    let breweryCount = 0;
    let finishedAt: string = new Date().toISOString();

    try {
      // Fetch fresh data from Google Sheets pipeline
      const processed = await getProcessedBreweryData();
      breweryCount = processed.breweries.length;
      finishedAt = new Date().toISOString();
    } finally {
      clearTimeout(timer);
    }

    // Clear relevant caches by revalidating key routes
    // Revalidate the root layout to cascade updates
    revalidatePath('/', 'layout');
    // High-traffic landing pages and indexes
    revalidatePath('/');
    revalidatePath('/city');
    revalidatePath('/county');
    revalidatePath('/map');
    revalidatePath('/open-now');

    const durationMs = Date.now() - startedAt;
    console.log('[SYNC] completed', { breweryCount, durationMs, finishedAt });

    return NextResponse.json({
      ok: true,
      breweryCount,
      finishedAt,
      durationMs,
      revalidated: ['/', '/city', '/county', '/map', '/open-now', 'layout'],
    });
  } catch (error: any) {
    console.error('[SYNC] failed', error);
    const message = error?.name === 'AbortError' ? 'Sync timed out' : (error?.message || 'Unknown error');
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
