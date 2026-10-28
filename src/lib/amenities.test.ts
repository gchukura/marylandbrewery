import { describe, expect, it } from 'vitest';
import { AMENITIES, AMENITY_ALIASES, amenityByDbValue, amenityForValue, getAmenity, hasAmenity, isIndexableCityAmenity } from './amenities';

describe('amenities', () => {
  it('has unique slugs and values, and no alias shadows a real page', () => {
    expect(new Set(AMENITIES.map((a) => a.slug)).size).toBe(AMENITIES.length);
    expect(new Set(AMENITIES.map((a) => a.dbValue)).size).toBe(AMENITIES.length);
    for (const [alias, target] of Object.entries(AMENITY_ALIASES)) {
      expect(getAmenity(alias)).toBeUndefined();
      if (target) expect(getAmenity(target)).toBeDefined();
    }
  });

  it('maps stored values to pages', () => {
    expect(amenityByDbValue('Pet Friendly')?.slug).toBe('pet-friendly');
    expect(amenityByDbValue('Food')).toBeUndefined(); // same breweries as Full Kitchen
    expect(amenityForValue('Food')?.slug).toBe('full-kitchen');
    expect(amenityByDbValue('Allows Visitors')).toBeUndefined();
  });

  it('matches exactly, not by substring', () => {
    const kitchen = getAmenity('full-kitchen')!;
    expect(hasAmenity({ amenities: ['Full Kitchen'] }, kitchen)).toBe(true);
    expect(hasAmenity({ amenities: ['Food'] }, kitchen)).toBe(false);
  });

  it('indexes city x amenity pages from 3 breweries', () => {
    expect(isIndexableCityAmenity(2)).toBe(false);
    expect(isIndexableCityAmenity(3)).toBe(true);
  });
});
