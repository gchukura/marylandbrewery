import { describe, expect, it } from 'vitest';
import {
  directionsUrl,
  headlineMeta,
  pickExcerpts,
  reviewerShortName,
  themeChips,
  visitTiles,
} from './brewery-page';
import type { ReviewThemes } from '@/types/brewery';

// Tuesday 2026-10-27, noon in Maryland
const NOON_TUESDAY = new Date('2026-10-27T16:00:00Z');
const base = {
  amenities: [] as string[],
  outdoorSeating: false,
  dogFriendly: false,
  parking: undefined,
  beerToGo: false,
  hasMerch: false,
};

describe('visitTiles', () => {
  it('builds Today, Seating, Parking and To go from positive data', () => {
    const tiles = visitTiles(
      {
        ...base,
        hours: { tuesday: '11:00 AM – 9:00 PM' },
        outdoorSeating: true,
        dogFriendly: true,
        parking: 'yes',
        beerToGo: true,
        hasMerch: true,
      },
      NOON_TUESDAY
    );
    expect(tiles).toEqual([
      {
        label: 'Today',
        value: '11:00 AM – 9:00 PM',
        note: 'Open now, until 9 PM',
      },
      { label: 'Seating', value: 'Outdoor seating', note: 'Dogs welcome' },
      { label: 'Parking', value: 'Parking on site' },
      { label: 'To go', value: 'Beer to go', note: 'Merch for sale too' },
    ]);
  });

  it('reads the amenity list too, and says when it next opens', () => {
    const tiles = visitTiles(
      {
        ...base,
        hours: { tuesday: 'Closed', thursday: '4:00 – 10:00 PM' },
        amenities: ['Pet Friendly', 'Parking'],
      },
      NOON_TUESDAY
    );
    expect(tiles.map((t) => [t.label, t.value, t.note])).toEqual([
      ['Today', 'Closed', 'Opens Thu at 4 PM'],
      ['Seating', 'Dog-friendly', undefined],
      ['Parking', 'Parking on site', undefined],
    ]);
  });

  it('shows nothing for unknown or negative data', () => {
    expect(visitTiles({ ...base, hours: {} }, NOON_TUESDAY)).toEqual([]);
  });
});

describe('themeChips', () => {
  const t = (matchCount: number, keywords: string[] = []) => ({
    detected: matchCount > 0,
    score: 0.5,
    keywords,
    matchCount,
  });
  it('lists detected themes, most mentioned first, with a few phrases', () => {
    const themes = {
      beer_quality: t(14, ['good selection', 'stout', 'craft brew', 'ipa']),
      atmosphere: t(10),
      service_staff: t(0),
      food_menu: t(2),
    } as unknown as ReviewThemes;
    expect(themeChips(themes)).toEqual([
      {
        label: 'Beer',
        count: 14,
        phrases: ['good selection', 'stout', 'craft brew'],
      },
      { label: 'Atmosphere', count: 10, phrases: [] },
      { label: 'Food', count: 2, phrases: [] },
    ]);
    expect(themeChips(undefined)).toEqual([]);
  });
});

describe('reviews', () => {
  it('shortens reviewer names', () => {
    expect(reviewerShortName('jesse sartor')).toBe('Jesse S.');
    expect(reviewerShortName('Mary Ann de la Cruz')).toBe('Mary C.');
    expect(reviewerShortName('cher')).toBe('Cher');
    expect(reviewerShortName('  ')).toBe('A reviewer');
  });

  it('picks recent excerpts with text, at most two per source when others exist', () => {
    const long = (s: string) => `${s} `.repeat(20).trim();
    const r = (source: string, ts: number, text = long(source + ts)) => ({
      review_text: text,
      reviewer_name: 'Pat Doe',
      review_timestamp: ts,
      source,
      rating: 5,
    });
    const picked = pickExcerpts([
      r('google', 5),
      r('google', 4),
      r('google', 3),
      r('yelp', 2),
      r('google', 1),
      r('yelp', 0, 'Too short'),
    ]);
    // Two newest Google, then Yelp; the fourth place is filled by the next Google one (not the
    // oldest). Shown newest first.
    expect(picked.map((e) => e.source)).toEqual([
      'Google',
      'Google',
      'Google',
      'Yelp',
    ]);
    expect(picked.map((e) => e.text.split(' ')[0])).toEqual([
      'google5',
      'google4',
      'google3',
      'yelp2',
    ]);
    expect(picked[0]).toMatchObject({
      reviewer: 'Pat D.',
      month: 'December 1969',
    });
    expect(picked.every((e) => e.text.length <= 260)).toBe(true);
  });
});

describe('headline and directions', () => {
  const label = (c: string) => `${c} County`;
  it('joins type, place and opening year, skipping what is missing', () => {
    expect(
      headlineMeta(
        {
          type: ['Microbrewery', 'Taproom'],
          city: 'Frederick',
          county: 'Frederick',
          openedDate: '2016-05-01',
        },
        label
      )
    ).toBe(
      'Microbrewery and Taproom · Frederick, Frederick County · Opened 2016'
    );
    expect(
      headlineMeta(
        {
          type: ['Planned'],
          city: 'Bethesda',
          county: '',
          openedDate: undefined,
        },
        label
      )
    ).toBe('Bethesda');
  });

  it('links Google Maps directions, by place ID when known', () => {
    const url = new URL(
      directionsUrl({
        name: 'Union Craft',
        street: '1700 W 41st St',
        city: 'Baltimore',
        zip: '21211',
        placeId: 'abc',
        latitude: 0,
        longitude: 0,
      })
    );
    expect(url.searchParams.get('destination')).toBe(
      'Union Craft, 1700 W 41st St, Baltimore, MD, 21211'
    );
    expect(url.searchParams.get('destination_place_id')).toBe('abc');
  });
});
