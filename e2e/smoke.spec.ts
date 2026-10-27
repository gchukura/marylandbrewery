import { expect, test } from '@playwright/test';

test('homepage returns 200 and has an h1', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('/cities/frederick/breweries lists at least one brewery', async ({ page }) => {
  const response = await page.goto('/cities/frederick/breweries');
  expect(response?.status()).toBe(200);
  expect(await page.locator('a[href^="/breweries/"]').count()).toBeGreaterThan(0);
});

test('a brewery page renders its name in the h1', async ({ page, request }) => {
  // Pick a brewery from live data: the first brewery URL in the sitemap
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const slug = sitemap.match(/\/breweries\/([a-z0-9-]+)<\/loc>/)?.[1];
  expect(slug, 'sitemap lists at least one brewery').toBeTruthy();

  const response = await page.goto(`/breweries/${slug}`);
  expect(response?.status()).toBe(200);
  const h1 = (await page.locator('h1').first().innerText()).trim();
  expect(h1.length).toBeGreaterThan(0);
  // The page title starts with the brewery name ("<Name> - <City>, MD | ...")
  expect(await page.title()).toContain(h1);
});
