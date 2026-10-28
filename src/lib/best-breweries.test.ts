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

describe('best-of ranking', () => {
  it('weights review volume, so a well-reviewed 4.7 beats a 5.0 from three people', async () => {
    const { breweryScore } = await import('./best-breweries');
    expect(breweryScore({ googleRating: 4.7, googleRatingCount: 1000 })).toBeGreaterThan(breweryScore({ googleRating: 5, googleRatingCount: 3 }));
    expect(breweryScore({})).toBe(0);
  });

  it('explains each position in one line', async () => {
    const { rankingReason } = await import('./best-breweries');
    expect(rankingReason({ googleRating: 4.8, googleRatingCount: 1234 })).toBe('4.8★ from 1,234 Google reviews');
    expect(rankingReason({ yelpRating: 4.5 })).toBe('No Google rating yet (4.5★ on Yelp)');
    expect(rankingReason({})).toBe('No ratings yet');
  });
});
