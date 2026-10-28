import { describe, expect, it, vi } from 'vitest';

describe('canOptimizeImage', () => {
  it('allows local files and our Storage bucket only', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.resetModules();
    const { canOptimizeImage } = await import('./images');
    expect(canOptimizeImage('/photos/1-1.jpg')).toBe(true);
    expect(canOptimizeImage('https://abc.supabase.co/storage/v1/object/public/brewery-media/logos/x.webp')).toBe(true);
    expect(canOptimizeImage('https://maps.googleapis.com/maps/api/place/photo?x=1')).toBe(false); // browser key: 403 server-side
    expect(canOptimizeImage('https://example-brewery.com/logo.png')).toBe(false);
    expect(canOptimizeImage('https://abc.supabase.co/auth/v1/x')).toBe(false);
    expect(canOptimizeImage('//cdn.example.com/x.png')).toBe(false);
    expect(canOptimizeImage(undefined)).toBe(false);
    vi.unstubAllEnvs();
  });
});
