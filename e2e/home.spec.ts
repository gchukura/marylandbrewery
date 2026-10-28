import { expect, test } from '@playwright/test';

test('hero: photo, headline and chips that open filtered maps', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('main section').first();
  const photo = hero.locator('img').first();
  const box = await photo.boundingBox();
  expect(box?.height ?? 0, 'hero photo has height').toBeGreaterThan(250);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Every brewery in Maryland, one map.'
  );
  await expect(
    hero.getByRole('link', { name: /^Open now · \d+$/ })
  ).toHaveAttribute('href', '/map?open=1');
  await expect(
    hero.getByRole('link', { name: 'Dog-friendly', exact: true })
  ).toHaveAttribute('href', '/map?amenity=pet-friendly');
  await expect(
    hero.getByRole('link', { name: 'Near me', exact: true })
  ).toHaveAttribute('href', '/map?near=1');
});

test('the county map is keyboard accessible', async ({ page }) => {
  await page.goto('/');
  const frederick = page.locator('svg a[aria-label^="Frederick County:"]');
  await expect(frederick).toHaveAttribute(
    'aria-label',
    /^Frederick County: \d+ breweries$/
  );
  await frederick.focus();
  await expect(frederick).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/counties\/frederick\/breweries$/);
});

test('the county list fallback lists every county', async ({ page }) => {
  await page.goto('/');
  await page.getByText('All counties as a list').click();
  await expect(page.locator('details li')).toHaveCount(24);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('bottom tab bar shows on phones and marks Home', async ({ page }) => {
    await page.goto('/');
    const tabs = page.getByRole('navigation', { name: 'Sections' });
    await expect(tabs).toBeVisible();
    await expect(tabs.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(tabs.getByRole('link', { name: 'Saved' })).toHaveAttribute(
      'href',
      '/saved'
    );
  });
});

test('no bottom tab bar on desktop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeHidden();
});
