import { expect, test } from '@playwright/test';

const CITY = '/cities/frederick/breweries';

/** Load a listing page and wait until React has hydrated it, so clicks are handled. */
async function openListing(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.locator('[data-listing][data-ready]').waitFor();
}

/** "Showing 12 breweries, open now first" -> 12 */
async function shownCount(
  page: import('@playwright/test').Page
): Promise<number> {
  const text = await page.locator('[aria-live="polite"]').first().innerText();
  return Number(text.match(/Showing (\d+)/)?.[1] ?? NaN);
}

test('an amenity filter is kept in the URL: click, reload, back', async ({
  page,
}) => {
  await openListing(page, CITY);
  const chip = page.getByRole('button', { name: 'Pet Friendly' });
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
  const all = await shownCount(page);
  expect(all).toBeGreaterThan(0);

  await chip.click();
  await expect(page).toHaveURL(/[?&]amenity=pet-friendly\b/);
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[aria-live="polite"]').first()).toContainText(
    'pet friendly'
  );
  const filtered = await shownCount(page);
  expect(filtered).toBeLessThanOrEqual(all);
  // Every row shown has the amenity
  const rows = page.locator('main a[href^="/breweries/"]:visible');
  await expect(rows.first()).toBeVisible();
  for (const row of await rows.all())
    await expect(row).toContainText('Pet Friendly');

  await page.reload();
  await page.locator('[data-listing][data-ready]').waitFor();
  await expect(
    page.getByRole('button', { name: 'Pet Friendly' })
  ).toHaveAttribute('aria-pressed', 'true');
  expect(await shownCount(page)).toBe(filtered);

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${CITY}$`));
  await expect(
    page.getByRole('button', { name: 'Pet Friendly' })
  ).toHaveAttribute('aria-pressed', 'false');
  expect(await shownCount(page)).toBe(all);
});

test('the unfiltered list is in the server HTML', async ({ request }) => {
  const html = await (await request.get(CITY)).text();
  expect(html).toContain('Showing ');
  expect((html.match(/href="\/breweries\//g) ?? []).length).toBeGreaterThan(0);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('List | Map toggle mounts the map only when shown', async ({ page }) => {
    await openListing(page, CITY);
    const mapButton = page.getByRole('button', { name: 'Map', exact: true });
    const mapSlot = page.locator('[data-listing-map]');
    await expect(
      page.getByRole('button', { name: 'List', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    // The map (or its placeholder) isn't mounted until the Map view is chosen
    await expect(mapSlot).toBeHidden();
    await expect(mapSlot.locator('> *')).toHaveCount(0);

    await mapButton.click();
    await expect(mapButton).toHaveAttribute('aria-pressed', 'true');
    await expect(mapSlot).toBeVisible();
    await expect(mapSlot.locator('> *').first()).toBeVisible();
    await expect(
      page.locator('main a[href^="/breweries/"]:visible')
    ).toHaveCount(0);
  });
});

test('/map?search= redirects to ?q= and filters', async ({ page }) => {
  const response = await page.goto('/map?search=frederick');
  await page.locator('[data-listing][data-ready]').waitFor();
  expect(response?.url()).toMatch(/\/map\?q=frederick$/);
  await expect(page.locator('[aria-live="polite"]').first()).toContainText(
    'matching “frederick”'
  );
});

test('search suggestions work from the keyboard', async ({ page }) => {
  await page.goto('/');
  const box = page.getByRole('combobox');
  await box.click();
  await box.fill('frederi');
  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option').first()).toBeVisible();
  await box.press('ArrowDown');
  await expect(box).toHaveAttribute('aria-activedescendant', /opt-0$/);
  await box.press('Enter');
  await expect(page).toHaveURL(/\/cities\/frederick\/breweries$/);
});
