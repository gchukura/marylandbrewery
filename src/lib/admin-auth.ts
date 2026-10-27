import { createHash, timingSafeEqual } from 'crypto';

/**
 * True only when the request's x-admin-token header matches ADMIN_SYNC_TOKEN.
 * Fails closed when the env var is unset.
 */
export function isAdminRequest(req: Request): boolean {
  const expected = process.env.ADMIN_SYNC_TOKEN || '';
  const provided = req.headers.get('x-admin-token') || '';
  if (!expected || !provided) return false;
  // Hash both sides so timingSafeEqual gets equal-length buffers.
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
