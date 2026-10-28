/**
 * Whether next/image can optimize a src: local files, this project's Supabase Storage and
 * Google Places photos (the remotePatterns in next.config.ts). Anything else, such as a logo
 * hosted on a brewery's own site, has to stay a plain <img>.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

export function canOptimizeImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    if (url.hostname === 'maps.googleapis.com') return true;
    return url.hostname === supabaseHost && url.pathname.startsWith('/storage/v1/object/public/');
  } catch {
    return false;
  }
}
