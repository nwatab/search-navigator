import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

const GOOGLE_ALL_URL = 'https://www.google.com/search?q=github+closes+comment+pr';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.google.com/search': '20250529_all_tokyo_10.html',
  });
});

test('highlights the first result on load', async ({ page }) => {
  await page.goto(GOOGLE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  const firstHeading = page.locator('#rso h3, #search h3').first();
  await expect(highlighted.locator('h3').first()).toHaveText(
    (await firstHeading.textContent()) ?? ''
  );
});

test('moves the highlight down with j and back up with k', async ({
  page,
}) => {
  await page.goto(GOOGLE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  const headingOfHighlighted = () =>
    highlighted.locator('h3').first().textContent();

  const first = await headingOfHighlighted();
  await page.keyboard.press('j');
  await expect(highlighted).toHaveCount(1);
  const second = await headingOfHighlighted();
  expect(second).not.toBe(first);

  await page.keyboard.press('k');
  await expect(highlighted).toHaveCount(1);
  expect(await headingOfHighlighted()).toBe(first);
});

test('opens the highlighted result with Enter', async ({ page }) => {
  await page.goto(GOOGLE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  const href = await highlighted.locator('a[href]').first().getAttribute('href');
  expect(href).toMatch(/^https?:\/\//);

  await page.keyboard.press('Enter');
  await page.waitForURL(href!);
});
