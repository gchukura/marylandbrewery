import { brandImage, OG_ALT, OG_SIZE } from '@/lib/og/brand-image';

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandImage();
}
