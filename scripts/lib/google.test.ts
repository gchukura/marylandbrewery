import { afterEach, describe, expect, it, vi } from 'vitest';
import { explainGoogleStatus, googleServerKey, optionalGoogleServerKey } from './google';

afterEach(() => vi.unstubAllEnvs());

describe('googleServerKey', () => {
  it('uses GOOGLE_MAPS_API_KEY, never the browser key', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'browser');
    vi.stubEnv('GOOGLE_MAPS_API_KEY', ' server ');
    expect(googleServerKey()).toBe('server');
  });

  it('throws with setup steps when unset, even if a browser key exists', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'browser');
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '');
    expect(() => googleServerKey()).toThrow(/docs\/setup\.md#google-server-key/);
    expect(optionalGoogleServerKey()).toBeUndefined();
  });

  it('refuses the browser key copied into GOOGLE_MAPS_API_KEY', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', 'same');
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'same');
    expect(() => googleServerKey()).toThrow(/browser key/);
  });
});

describe('explainGoogleStatus', () => {
  it('turns REQUEST_DENIED into a fix', () => {
    expect(explainGoogleStatus('REQUEST_DENIED', 'not authorized.')).toMatch(/no website restriction/);
    expect(explainGoogleStatus('INVALID_REQUEST')).toBe('INVALID_REQUEST');
  });
});
