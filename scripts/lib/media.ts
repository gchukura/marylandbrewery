/**
 * Brewery photos and logos in Supabase Storage (bucket brewery-media). Shared by
 * migrate-media-to-storage, download-google-photos and fetch-brewery-logos so every image gets
 * the same processing. Scripts only: sharp is never imported by the site.
 */
import sharp from 'sharp';
import type { TypedClient } from '@/lib/db/client';

export const MEDIA_BUCKET = 'brewery-media';

const PHOTO_MAX_EDGE = 1600;
const PHOTO_QUALITY = 80;
const LOGO_MAX_EDGE = 512;
const LOGO_QUALITY = 90;

export const photoPath = (brewerySlug: string, n: number) => `photos/${brewerySlug}/${n}.webp`;
export const logoPath = (brewerySlug: string) => `logos/${brewerySlug}.webp`;

/** Public URL of an object, e.g. https://<ref>.supabase.co/storage/v1/object/public/brewery-media/logos/x.webp */
export function publicMediaUrl(objectPath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${MEDIA_BUCKET}/${objectPath}`;
}

export interface ProcessedImage {
  buffer: Buffer;
  /** Real format from the file's bytes (some .jpg files are PNGs, some .png are WebP) */
  sourceFormat: string;
  width: number;
  height: number;
}

async function toWebp(input: Buffer, maxEdge: number, quality: number, keepAlpha: boolean): Promise<ProcessedImage> {
  const image = sharp(input, { failOn: 'none' }).rotate(); // rotate() applies EXIF orientation
  const meta = await image.metadata();
  const out = await image
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, alphaQuality: keepAlpha ? 100 : undefined, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: out.data, sourceFormat: meta.format ?? 'unknown', width: out.info.width, height: out.info.height };
}

/** Photos: at most 1600px on the long edge, WebP quality 80. */
export const processPhoto = (input: Buffer) => toWebp(input, PHOTO_MAX_EDGE, PHOTO_QUALITY, false);

/** Logos: at most 512px, WebP keeping transparency. SVGs are rasterized. */
export const processLogo = (input: Buffer) => toWebp(input, LOGO_MAX_EDGE, LOGO_QUALITY, true);

/** Sizes of the objects already in a folder, keyed by object path. */
export async function existingObjectSizes(client: TypedClient, folder: string): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.storage.from(MEDIA_BUCKET).list(folder, { limit: 1000, offset });
    if (error) throw error;
    for (const obj of data) {
      const size = (obj.metadata as { size?: number } | null)?.size;
      if (typeof size === 'number') sizes.set(`${folder}/${obj.name}`, size);
    }
    if (data.length < 1000) break;
  }
  return sizes;
}

/**
 * Upload unless an object of the same size is already there (idempotent re-runs).
 * Returns 'skipped' or 'uploaded'.
 */
export async function uploadIfChanged(
  client: TypedClient,
  objectPath: string,
  buffer: Buffer,
  existing: Map<string, number>
): Promise<'skipped' | 'uploaded'> {
  if (existing.get(objectPath) === buffer.length) return 'skipped';
  const { error } = await client.storage
    .from(MEDIA_BUCKET)
    .upload(objectPath, buffer, { contentType: 'image/webp', upsert: true, cacheControl: '604800' });
  if (error) throw new Error(`Upload ${objectPath} failed: ${error.message}`);
  existing.set(objectPath, buffer.length);
  return 'uploaded';
}
