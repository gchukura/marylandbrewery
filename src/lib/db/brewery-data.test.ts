import { describe, expect, it } from 'vitest';
import { processBreweryData } from './brewery-data';
import type { Brewery } from '@/types/brewery';

function makeBrewery(overrides: Partial<Brewery>): Brewery {
  return {
    id: 'id',
    name: 'Brewery',
    slug: 'brewery',
    type: ['Microbrewery'],
    street: '1 Main St',
    city: 'Baltimore',
    state: 'MD',
    zip: '21201',
    county: 'Baltimore City',
    latitude: 39.29,
    longitude: -76.61,
    socialMedia: {},
    hours: {},
    amenities: [],
    allowsVisitors: true,
    offersTours: false,
    beerToGo: false,
    hasMerch: false,
    memberships: [],
    lastUpdated: '2026-10-27',
    ...overrides,
  };
}

describe('processBreweryData', () => {
  const breweries = [
    makeBrewery({ id: 'a', city: 'Baltimore', county: 'Baltimore City', amenities: ['Dog Friendly'] }),
    makeBrewery({ id: 'b', city: 'baltimore ', county: 'Baltimore City', type: ['Brewpub'] }),
    makeBrewery({ id: 'c', city: 'Frederick', county: 'Frederick', amenities: ['Dog Friendly', 'Food'] }),
  ];

  it('groups by lowercased, trimmed keys in real Maps', async () => {
    const processed = await processBreweryData(breweries);

    expect(processed.byCity).toBeInstanceOf(Map);
    expect(processed.byCity.get('baltimore')?.map((b) => b.id)).toEqual(['a', 'b']);
    expect(processed.byCounty.get('frederick')?.map((b) => b.id)).toEqual(['c']);
    expect(processed.byType.get('brewpub')?.map((b) => b.id)).toEqual(['b']);
    expect(processed.byAmenity.get('dog friendly')?.map((b) => b.id)).toEqual(['a', 'c']);
  });

  it('loses the groupings when JSON round-tripped, which is why it must not be cached', async () => {
    const processed = await processBreweryData(breweries);
    const roundTripped = JSON.parse(JSON.stringify(processed));

    expect(roundTripped.byCity).toEqual({});
  });
});
