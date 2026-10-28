/**
 * Whether next/image can optimize a src: local files and this project's Supabase Storage.
 * Anything else, such as a logo hosted on a brewery's own site, has to stay a plain <img>.
 * Google Places photo URLs (breweries.photo_url) carry the site's browser key, which is restricted
 * to the site's domains: the browser can load them, the /_next/image server fetch gets a 403.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

export function canOptimizeImage(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    return url.hostname === supabaseHost && url.pathname.startsWith('/storage/v1/object/public/');
  } catch {
    return false;
  }
}
