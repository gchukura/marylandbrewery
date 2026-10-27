import { describe, expect, it } from 'vitest';
import { bestBreweriesCityPath, hasBestBreweriesPage } from './best-breweries';

describe('best-breweries routing rule', () => {
  it('gives a best-of page only to cities with 5+ breweries', () => {
    expect(hasBestBreweriesPage(4)).toBe(false);
    expect(hasBestBreweriesPage(5)).toBe(true);
  });

  it('points smaller cities at the city listing', () => {
    expect(bestBreweriesCityPath('arnold', 2)).toBe('/cities/arnold/breweries');
    expect(bestBreweriesCityPath('baltimore', 26)).toBe('/best-breweries/baltimore');
  });
});
