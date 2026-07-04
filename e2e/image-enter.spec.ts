import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

const GOOGLE_IMAGE_URL =
  'https://www.google.com/search?tbm=isch&q=ch%C3%A2teau-chalon';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.google.com/search': '20250614-image-château-chalon-tokyo.html',
  });
});

test('Enter enlarges the image, Enter again opens the source page', async ({
  page,
}) => {
  await page.goto(GOOGLE_IMAGE_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);

  // Move to the second result so the test also covers per-result state.
  await page.keyboard.press('j');
  await expect(highlighted).toHaveCount(1);
  const sourceHref = await highlighted
    .locator('a[href^="http"]')
    .first()
    .getAttribute('href');
  expect(sourceHref).toMatch(/^https?:\/\//);

  // First Enter clicks the thumbnail anchor (opens Google's preview panel
  // on the live site) and must not leave the results page nor open the
  // source page in a new tab.
  let popupsOpened = 0;
  page.on('popup', () => popupsOpened++);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  expect(page.url()).toBe(GOOGLE_IMAGE_URL);
  expect(popupsOpened).toBe(0);

  // Second Enter on the same result opens the source page; the anchor has
  // target="_blank", so it opens in a new tab.
  const [sourcePage] = await Promise.all([
    page.waitForEvent('popup'),
    page.keyboard.press('Enter'),
  ]);
  await sourcePage.waitForURL(sourceHref!);
});
