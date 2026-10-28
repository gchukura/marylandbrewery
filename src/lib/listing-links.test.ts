import { describe, expect, it } from 'vitest';
import type { Brewery } from '@/types/brewery';
import { cityListingPath } from './listing-links';

describe('cityListingPath', () => {
  const byCity = new Map<string, Brewery[]>([
    ['frederick', []],
    ['ellicott city', []],
  ]);

  it('links cities that have a listing', () => {
    expect(cityListingPath(byCity, 'Frederick')).toBe('/cities/frederick/breweries');
    expect(cityListingPath(byCity, 'Ellicott City')).toBe('/cities/ellicott-city/breweries');
  });

  it('skips towns with no breweries and missing cities', () => {
    expect(cityListingPath(byCity, 'Takoma Park')).toBeNull();
    expect(cityListingPath(byCity, null)).toBeNull();
  });
});
