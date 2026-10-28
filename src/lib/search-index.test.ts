import { describe, expect, it } from 'vitest';
import {
  expandSearchIndex,
  matchSearch,
  type SearchIndex,
} from './search-index';

const index: SearchIndex = {
  brewery: [
    [
      'Frederick Brewing Company',
      '/breweries/frederick-brewing-company',
      'Frederick',
    ],
    ['Attaboy Barrel House', '/breweries/attaboy-barrel-house', 'Frederick'],
    ['Brewer’s Alley', '/breweries/brewers-alley', 'Frederick'],
    ['Olde Mother Brewing', '/breweries/olde-mother-brewing', 'Frederick'],
  ],
  city: [
    ['Frederick', '/cities/frederick/breweries', '12 breweries'],
    ['Prince Frederick', '/cities/prince-frederick/breweries', '2 breweries'],
  ],
  county: [
    ['Frederick County', '/counties/frederick/breweries', '20 breweries'],
  ],
  amenity: [['Pet Friendly', '/amenities/pet-friendly', 'Amenity']],
};
const items = expandSearchIndex(index);
const labels = (q: string, limit?: number) =>
  matchSearch(items, q, limit).map((i) => i.label);

describe('matchSearch', () => {
  it('ranks label prefix > word prefix > anywhere, places before breweries on ties', () => {
    expect(labels('fred')).toEqual([
      'Frederick',
      'Frederick County',
      'Frederick Brewing Company',
      'Prince Frederick',
    ]);
  });

  it('needs every word, ignores case, accents and apostrophes', () => {
    expect(labels('brewers alley')).toEqual(['Brewer’s Alley']);
    expect(labels('MOTHER brew')).toEqual(['Olde Mother Brewing']);
    expect(labels('pet')).toEqual(['Pet Friendly']);
  });

  it('returns nothing for an empty query and respects the limit', () => {
    expect(labels('   ')).toEqual([]);
    expect(labels('e', 2)).toHaveLength(2);
  });
});
