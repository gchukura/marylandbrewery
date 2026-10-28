/**
 * What the brewery page shows, derived from the row: visit tiles, review theme chips, review
 * excerpts, the headline line, directions. Pure functions; each returns nothing when the data
 * isn't there, so the page can hide the section instead of printing placeholder text.
 */
import type { Brewery, ReviewThemes, ThemeResult } from '@/types/brewery';
import type { Tables } from '@/lib/db';
import { amenityForValue } from '@/lib/amenities';
import {
  formatDayHours,
  isOpenAt,
  nextOpening,
  zonedDayAndMinutes,
  MARYLAND_TZ,
} from '@/lib/hours';

export interface VisitTile {
  label: string;
  value: string;
  note?: string;
}

const hasAmenity = (b: Pick<Brewery, 'amenities'>, label: string) =>
  (b.amenities ?? []).some(
    (a) =>
      (amenityForValue(a)?.label ?? a).toLowerCase() === label.toLowerCase()
  );

const shortTime = (t: string) => t.replace(':00 ', ' ');

type VisitData = Pick<
  Brewery,
  | 'hours'
  | 'amenities'
  | 'outdoorSeating'
  | 'dogFriendly'
  | 'parking'
  | 'beerToGo'
  | 'hasMerch'
>;

/**
 * Up to four tiles: Today, Seating, Parking, To go. A tile appears only for positive data:
 * `false` in these columns often means "unknown", so we never print "No outdoor seating".
 */
export function visitTiles(b: VisitData, now = new Date()): VisitTile[] {
  const tiles: VisitTile[] = [];

  const { day } = zonedDayAndMinutes(now);
  const today = b.hours?.[day];
  if (today) {
    const status = isOpenAt(b.hours, now);
    const next = nextOpening(b.hours, now);
    const note =
      status.open && status.closesAt
        ? `Open now, until ${shortTime(status.closesAt)}`
        : next
          ? `Opens ${next.isToday ? 'today' : next.day[0].toUpperCase() + next.day.slice(1, 3)} at ${shortTime(next.time)}`
          : undefined;
    tiles.push({ label: 'Today', value: formatDayHours(today), note });
  }

  const outdoor = b.outdoorSeating || hasAmenity(b, 'Outdoor Seating');
  const dogs = b.dogFriendly || hasAmenity(b, 'Pet Friendly');
  if (outdoor || dogs) {
    tiles.push({
      label: 'Seating',
      value: outdoor ? 'Outdoor seating' : 'Dog-friendly',
      note: outdoor && dogs ? 'Dogs welcome' : undefined,
    });
  }

  if (b.parking === 'yes' || hasAmenity(b, 'Parking'))
    tiles.push({ label: 'Parking', value: 'Parking on site' });

  const toGo = b.beerToGo || hasAmenity(b, 'Beer To Go');
  if (toGo)
    tiles.push({
      label: 'To go',
      value: 'Beer to go',
      note:
        b.hasMerch || hasAmenity(b, 'Merchandise')
          ? 'Merch for sale too'
          : undefined,
    });

  return tiles;
}

const THEMES: {
  key: keyof Pick<
    ReviewThemes,
    'beer_quality' | 'atmosphere' | 'service_staff' | 'food_menu'
  >;
  label: string;
}[] = [
  { key: 'beer_quality', label: 'Beer' },
  { key: 'atmosphere', label: 'Atmosphere' },
  { key: 'service_staff', label: 'Service' },
  { key: 'food_menu', label: 'Food' },
];

export interface ThemeChip {
  label: string;
  /** How many review mentions matched */
  count: number;
  /** A few of the phrases people used */
  phrases: string[];
}

/** Review themes people mention, most mentioned first. */
export function themeChips(
  themes: ReviewThemes | null | undefined
): ThemeChip[] {
  if (!themes) return [];
  return THEMES.map(({ key, label }) => ({
    label,
    theme: themes[key] as ThemeResult | undefined,
  }))
    .filter(
      (t): t is { label: string; theme: ThemeResult } =>
        !!t.theme?.detected && t.theme.matchCount > 0
    )
    .map(({ label, theme }) => ({
      label,
      count: theme.matchCount,
      phrases: theme.keywords.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count);
}

/** "jesse sartor" -> "Jesse S."; one word stays as it is, capitalized. */
export function reviewerShortName(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A reviewer';
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
  return words.length === 1
    ? cap(words[0])
    : `${cap(words[0])} ${words[words.length - 1][0].toUpperCase()}.`;
}

export interface Excerpt {
  text: string;
  reviewer: string;
  /** "December 2025" */
  month: string | null;
  source: string;
  rating: number | null;
}

const MIN_LENGTH = 60;
const MAX_LENGTH = 260;

function trimTo(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean
    .slice(0, max - 1)
    .replace(/\s+\S*$/, '')
    .replace(/[,;:–-]+$/, '')}…`;
}

const SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  yelp: 'Yelp',
};

/**
 * Up to `limit` excerpts: reviews with real text, most recent first, at most two per source when
 * others are available, so a page isn't all Google. The month comes from the review timestamp (the
 * stored "3 weeks ago" text froze when it was fetched).
 */
export function pickExcerpts(
  reviews: Pick<
    Tables<'reviews'>,
    'review_text' | 'reviewer_name' | 'review_timestamp' | 'source' | 'rating'
  >[],
  limit = 4
): Excerpt[] {
  const usable = reviews
    .filter((r) => (r.review_text ?? '').trim().length >= MIN_LENGTH)
    .sort((a, b) => (b.review_timestamp ?? 0) - (a.review_timestamp ?? 0));

  // First pass: two per source; second pass: fill any remaining places
  const perSource = new Map<string, number>();
  const chosen = new Set<(typeof usable)[number]>();
  for (const r of usable) {
    const used = perSource.get(r.source ?? '') ?? 0;
    if (chosen.size === limit || used >= 2) continue;
    perSource.set(r.source ?? '', used + 1);
    chosen.add(r);
  }
  for (const r of usable) if (chosen.size < limit) chosen.add(r);

  return usable
    .filter((r) => chosen.has(r))
    .map((r) => ({
      text: trimTo(r.review_text ?? '', MAX_LENGTH),
      reviewer: reviewerShortName(r.reviewer_name),
      month: r.review_timestamp
        ? new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: MARYLAND_TZ,
          }).format(new Date(r.review_timestamp * 1000))
        : null,
      source: SOURCE_LABELS[r.source ?? ''] ?? (r.source || 'Review'),
      rating: r.rating ?? null,
    }));
}

/** "Microbrewery · Frederick, Frederick County · Opened 2016" (parts without data are left out). */
export function headlineMeta(
  b: Pick<Brewery, 'type' | 'city' | 'county' | 'openedDate'>,
  countyLabel: (c: string) => string
): string {
  const type = b.type?.filter((t) => t && t !== 'Planned').join(' and ');
  const place = [b.city, b.county ? countyLabel(b.county) : null]
    .filter(Boolean)
    .join(', ');
  const year = b.openedDate?.match(/\b(19|20)\d{2}\b/)?.[0];
  return [type, place, year ? `Opened ${year}` : null]
    .filter(Boolean)
    .join(' · ');
}

/** Google Maps directions to the brewery (by place ID when we have one). */
export function directionsUrl(
  b: Pick<
    Brewery,
    'name' | 'street' | 'city' | 'zip' | 'placeId' | 'latitude' | 'longitude'
  >
): string {
  const destination = [b.name, b.street, b.city, 'MD', b.zip]
    .filter(Boolean)
    .join(', ');
  const params = new URLSearchParams({ api: '1', destination });
  if (b.placeId) params.set('destination_place_id', b.placeId);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** "October 2026" from an ISO timestamp, in Maryland time. */
export function monthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: MARYLAND_TZ,
      }).format(date);
}
