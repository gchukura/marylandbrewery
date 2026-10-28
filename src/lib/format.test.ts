import { describe, expect, it } from 'vitest';
import { formatPhone } from './format';

describe('formatPhone', () => {
  it('formats 10- and 11-digit US numbers', () => {
    expect(formatPhone('4105550123')).toBe('(410) 555-0123');
    expect(formatPhone('+1 410.555.0123')).toBe('(410) 555-0123');
  });
  it('leaves anything else alone', () => {
    expect(formatPhone('ext. 12')).toBe('ext. 12');
  });
});
