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

describe('externalUrl', () => {
  it('adds https to bare domains and rejects non-URLs', async () => {
    const { externalUrl } = await import('./format');
    expect(externalUrl('www.libcobeer.com/')).toBe('https://www.libcobeer.com/');
    expect(externalUrl('https://x.com')).toBe('https://x.com');
    expect(externalUrl('@handle')).toBeUndefined();
    expect(externalUrl('')).toBeUndefined();
  });
});
