import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const token = process.env.ADMIN_SYNC_TOKEN || '';
    const provided = req.headers.get('x-admin-token') || '';
    if (!token || provided !== token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];

    if (paths.length === 0) {
      return NextResponse.json({ ok: false, error: 'No paths provided' }, { status: 400 });
    }

    const revalidated: string[] = [];
    for (const p of paths) {
      try {
        revalidatePath(p);
        revalidated.push(p);
      } catch (err) {
        console.warn('[REVALIDATE] failed', p, err);
      }
    }

    return NextResponse.json({ ok: true, revalidated });
  } catch (error: any) {
    console.error('[REVALIDATE] error', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
