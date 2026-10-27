import { describe, expect, it } from 'vitest';
import { deslugify, normalizeCountyName, slugify } from './data-utils';
import { calculateDistance } from './geo';

describe('slugify', () => {
  it('lowercases, strips punctuation and collapses separators', () => {
    expect(slugify("  Queen Anne's County ")).toBe('queen-annes-county');
    expect(slugify('Union Craft_Brewing--Co.')).toBe('union-craft-brewing-co');
  });
});

describe('deslugify', () => {
  it('title-cases each word', () => {
    expect(deslugify('ellicott-city')).toBe('Ellicott City');
  });
});

describe('normalizeCountyName', () => {
  it('maps apostrophe counties and plain counties', () => {
    expect(normalizeCountyName('queen-annes')).toBe("Queen Anne's");
    expect(normalizeCountyName('frederick')).toBe('Frederick');
  });

  it('returns null for unknown slugs', () => {
    expect(normalizeCountyName('not-a-county')).toBeNull();
  });
});

describe('calculateDistance', () => {
  it('is zero for the same point', () => {
    expect(calculateDistance(39.29, -76.61, 39.29, -76.61)).toBe(0);
  });

  it('returns miles between Baltimore and Annapolis (~22 mi straight line)', () => {
    const d = calculateDistance(39.2904, -76.6122, 38.9784, -76.4922);
    expect(d).toBeGreaterThan(20);
    expect(d).toBeLessThan(25);
  });
});
