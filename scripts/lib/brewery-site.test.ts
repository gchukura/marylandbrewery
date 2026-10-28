import { describe, expect, it } from 'vitest';
import { isJunkSocialUrl, pageMatchesBrewery, pageTitle } from './brewery-site';

describe('pageMatchesBrewery', () => {
  it('accepts a brewery own site by domain or title', () => {
    expect(pageMatchesBrewery('Flying Dog Brewery', 'https://flyingdog.com/', 'Home')).toBe(true);
    expect(pageMatchesBrewery('Saints Row Brewing', 'https://saintsrowbrewing.com/', '')).toBe(true);
    expect(pageMatchesBrewery('DuClaw Brewing Company', 'https://duclaw.com/', '')).toBe(true);
    expect(pageMatchesBrewery('Phoenix Upper Main', 'https://www.phoenixuppermain.com/', '')).toBe(true);
  });

  it('rejects sites that belong to someone else (cases found in the 2026-10 audit)', () => {
    expect(pageMatchesBrewery('LindGreen', 'https://aadermatology.com/', 'Dermatology & Aesthetic Skin Care Specialists | AAD Dermatology')).toBe(false);
    expect(pageMatchesBrewery('DuClaw Brewing Company', 'https://www.crookedcrabbrewing.com/', 'Crooked Crab Brewing Co.')).toBe(false);
    expect(pageMatchesBrewery('Seawolf Brewery', 'https://www.forwardeastport.com/', 'HOME | Forward Brewing')).toBe(false);
    expect(pageMatchesBrewery('Ruhlman Brewery/Our Ales', 'https://www.ourales.com/', '11BOLA : The Pitch Has Its Own Language')).toBe(false);
  });
});

describe('pageTitle', () => {
  it('decodes entities and collapses whitespace', () => {
    expect(pageTitle('<title>Saints Row Brewing &#8211;\n Gaithersburg</title>')).toBe('Saints Row Brewing Gaithersburg');
    expect(pageTitle('<html></html>')).toBe('');
  });
});

describe('isJunkSocialUrl', () => {
  it('rejects share buttons, pixels and posts', () => {
    for (const u of ['http://www.facebook.com/2008', 'https://www.facebook.com/tr', 'https://www.facebook.com/sharer', 'https://www.facebook.com/profile.php',
      'https://twitter.com/intent', 'https://x.com/i', 'https://www.instagram.com/p', 'https://untappd.com/v', 'https://www.facebook.com/']) {
      expect(isJunkSocialUrl(u), u).toBe(true);
    }
  });

  it('keeps real profiles, including numeric page ids and profile.php?id=', () => {
    for (const u of ['https://www.facebook.com/SinBrewing', 'https://www.facebook.com/259430286959', 'https://www.facebook.com/profile.php?id=61560416691263',
      'https://twitter.com/sinbrewing', 'https://www.instagram.com/dbcbeer', 'https://untappd.com/RealerevivalBrewing', 'https://untappd.com/w/1812-brewery/276895']) {
      expect(isJunkSocialUrl(u), u).toBe(false);
    }
  });
});
