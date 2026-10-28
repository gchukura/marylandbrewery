/**
 * Homepage settings you can edit.
 *
 * HERO_PHOTOS: 3–5 brewery photos from Supabase Storage for the hero (one is shown per day). After
 * changing the list, run `npm run home:blur` to refresh each photo's blur placeholder.
 */
export interface HeroPhoto {
  src: string;
  alt: string;
  /** Brewery page the photo belongs to, for the photo credit */
  brewerySlug: string;
  breweryName: string;
  /** Tiny blurred preview shown while the photo loads (written by npm run home:blur) */
  blurDataURL: string;
}

// Seeded 2026-10-28 from the most-reviewed breweries with photos (Guinness Open Gate skipped: closing)
export const HERO_PHOTOS: HeroPhoto[] = [
  {
    src: 'https://cslbsgdjuftrxhigfrru.supabase.co/storage/v1/object/public/brewery-media/photos/brewers-alley-restaurant-and-brewery/3.webp',
    alt: "Four pints lined up on the bar at Brewer's Alley in Frederick",
    brewerySlug: 'brewers-alley-restaurant-and-brewery',
    breweryName: "Brewer's Alley",
    blurDataURL:
      'data:image/webp;base64,UklGRnYAAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSBIAAAABD9D/iAiIBZP8pXemENH/bAFWUDggPgAAANABAJ0BKhAACQADgFolsAJ0ALFuf1AAAP7c+tPh7TIu9Xpt1SUqGEV9Chwxx6cJdCHBOClD2iIEvof0pRAA',
  },
  {
    src: 'https://cslbsgdjuftrxhigfrru.supabase.co/storage/v1/object/public/brewery-media/photos/pratt-street-ale-house/3.webp',
    alt: 'Tap handles at Pratt Street Ale House in Baltimore',
    brewerySlug: 'pratt-street-ale-house',
    breweryName: 'Pratt Street Ale House',
    blurDataURL:
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAsAA4BaJYwCdAEK99JwtxUAAP7xhj1MpZnb4uGHlrcuxpbxQ+YbVcs0QCWFSfzoIG/3vF6RmhND3eLyr3/qDnd9pCYOQwAAAA==',
  },
  {
    src: 'https://cslbsgdjuftrxhigfrru.supabase.co/storage/v1/object/public/brewery-media/photos/white-marsh-brewing-cored-brick-station/2.webp',
    alt: 'The bar at Red Brick Station in White Marsh',
    brewerySlug: 'white-marsh-brewing-cored-brick-station',
    breweryName: 'Red Brick Station',
    blurDataURL:
      'data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADQAQCdASoQAAwAA4BaJZACdAEOi8ATAAD+2nG1bDDKkr9sehvdyvu5TETFZq5BoR9GZweAAAA=',
  },
];

/** The photo for a given day, so the hero changes daily but is stable within a page's cache life. */
export function heroPhotoFor(date: Date): HeroPhoto {
  const day = Math.floor(date.getTime() / 86_400_000);
  return HERO_PHOTOS[day % HERO_PHOTOS.length];
}
