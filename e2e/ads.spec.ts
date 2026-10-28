import { expect, test } from '@playwright/test';

const SCRIPT = 'script[src*="adsbygoogle.js"]';

test('AdSense: verification meta tag in the HTML, script only after idle or interaction', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain(
    'name="google-adsense-account" content="ca-pub-4357894821158922"'
  );
  expect(html).not.toMatch(/<script[^>]+adsbygoogle\.js/);

  await page.goto('/');
  await page.mouse.wheel(0, 400);
  await expect(page.locator(SCRIPT)).toHaveCount(1, { timeout: 8000 });
});

test('the footer ad slot has a fixed height (no layout shift)', async ({
  page,
}) => {
  await page.goto('/');
  const slot = page
    .getByRole('complementary', { name: 'Advertisement' })
    .last();
  await expect(slot).toBeAttached();
  const before = (await slot.boundingBox())?.height;
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1500);
  expect((await slot.boundingBox())?.height).toBe(before);
});

for (const path of ['/contact', '/saved', '/this-page-does-not-exist']) {
  test(`no ads or AdSense script on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(5000);
    await expect(page.locator(SCRIPT)).toHaveCount(0);
    await expect(
      page.getByRole('complementary', { name: 'Advertisement' })
    ).toHaveCount(0);
  });
}

test('404 page offers search and popular pages', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    "We can't find that page"
  );
  await expect(page.getByRole('combobox')).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Popular pages' })
      .getByRole('link', { name: 'Brewery map' })
  ).toBeVisible();
});
