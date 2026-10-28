import { describe, expect, it } from 'vitest';
import { distanceMiles, sortByDistance } from './geo';
import {
  breweriesNearNeighborhood,
  isIndexableNeighborhood,
  isListedAttraction,
  legacyNeighborhoodSlug,
  neighborhoodPath,
} from './neighborhoods';

const canton = { latitude: 39.2779, longitude: -76.5759 };
// ~0.07° of latitude is ~4.8 miles
const near = { id: 'near', latitude: 39.2829, longitude: -76.5759 };
const mid = { id: 'mid', latitude: 39.3479, longitude: -76.5759 };
const far = { id: 'far', latitude: 39.6, longitude: -76.5759 };
const noCoords = { id: 'none' };

describe('geo', () => {
  it('computes haversine miles', () => {
    expect(distanceMiles(canton, canton)).toBe(0);
    expect(distanceMiles(canton, mid)).toBeCloseTo(4.84, 1);
  });

  it('sorts nearest first and drops items without coordinates', () => {
    const items: { id: string; latitude?: number; longitude?: number }[] = [far, noCoords, near, mid];
    expect(sortByDistance(canton, items).map((b) => b.id)).toEqual(['near', 'mid', 'far']);
  });
});

describe('neighborhoods', () => {
  it('lists breweries within 10 miles, nearest first', () => {
    expect(breweriesNearNeighborhood(canton, [far, mid, near]).map((b) => b.id)).toEqual(['near', 'mid']);
  });

  it('falls back to the nearest few when nothing is within 10 miles', () => {
    expect(breweriesNearNeighborhood(canton, [far]).map((b) => b.id)).toEqual(['far']);
  });

  it('indexes only neighborhoods with a brewery within 3 miles', () => {
    expect(isIndexableNeighborhood(0.4)).toBe(true);
    expect(isIndexableNeighborhood(3)).toBe(true);
    expect(isIndexableNeighborhood(4.8)).toBe(false);
    expect(isIndexableNeighborhood(undefined)).toBe(false);
  });

  it('builds the canonical path from the slug column', () => {
    expect(neighborhoodPath('canton')).toBe('/neighborhoods/canton');
  });

  it('lists parks, museums, entertainment and tourist-attraction landmarks only', () => {
    expect(isListedAttraction({ type: 'park' })).toBe(true);
    expect(isListedAttraction({ type: 'landmark', googleTypes: ['point_of_interest', 'tourist_attraction'] })).toBe(true);
    expect(isListedAttraction({ type: 'landmark', googleTypes: ['point_of_interest', 'shopping_mall'] })).toBe(false);
    expect(isListedAttraction({ type: 'landmark' })).toBe(false);
  });
});

describe('legacyNeighborhoodSlug', () => {
  it('rebuilds the old {neighborhood}-{city}-md slug', () => {
    expect(legacyNeighborhoodSlug({ slug: 'canton', city: 'Baltimore' })).toBe('canton-baltimore-md');
    expect(legacyNeighborhoodSlug({ slug: 'woodside', city: 'Silver Spring' })).toBe('woodside-silver-spring-md');
    expect(legacyNeighborhoodSlug({ slug: 'temple-hills', city: 'Temple Hills' })).toBe('temple-hills-temple-hills-md');
  });

  it('has no old slug without a city', () => {
    expect(legacyNeighborhoodSlug({ slug: 'canton', city: null })).toBeNull();
  });
});
