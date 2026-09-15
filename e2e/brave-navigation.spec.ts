import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

const BRAVE_ALL_URL = 'https://search.brave.com/search?q=tokyo';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://search.brave.com/search': '20260915-brave-all-tokyo.html',
    'https://search.brave.com/videos': '20260915-brave-videos-tokyo.html',
    'https://search.brave.com/news': '20260915-brave-news-tokyo.html',
    // Brave's own scripts are stripped from snapshots, so clicking an image
    // cannot open the preview panel here; this snapshot was saved with the
    // panel already open on the first result.
    'https://search.brave.com/images':
      '20260915-brave-image-preview-tokyo.html',
  });
});

const hrefOfHighlighted = (page: import('@playwright/test').Page) =>
  page
    .locator(HIGHLIGHT_SELECTOR)
    .locator('a[href]')
    .first()
    .getAttribute('href');

test('highlights the first result on load', async ({ page }) => {
  await page.goto(BRAVE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  await expect(highlighted).toHaveAttribute('data-type', 'web');
  expect(await hrefOfHighlighted(page)).toBe(
    'https://en.wikipedia.org/wiki/Tokyo'
  );
});

test('moves the highlight with j/k and arrow keys', async ({ page }) => {
  await page.goto(BRAVE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  const first = await hrefOfHighlighted(page);

  await page.keyboard.press('j');
  await expect(highlighted).toHaveCount(1);
  const second = await hrefOfHighlighted(page);
  expect(second).not.toBe(first);

  await page.keyboard.press('ArrowDown');
  await expect(highlighted).toHaveCount(1);
  expect(await hrefOfHighlighted(page)).not.toBe(second);

  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('k');
  await expect(highlighted).toHaveCount(1);
  expect(await hrefOfHighlighted(page)).toBe(first);
});

test('opens the highlighted result with Enter', async ({ page }) => {
  await page.goto(BRAVE_ALL_URL);
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);
  const href = await hrefOfHighlighted(page);

  await page.keyboard.press('Enter');
  await page.waitForURL(href!);
});

test('goes to the next page with l', async ({ page }) => {
  await page.goto(BRAVE_ALL_URL);
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);

  await page.keyboard.press('l');
  await page.waitForURL(/[?&]offset=1\b/);
});

test('switches between Brave tabs instead of Google', async ({ page }) => {
  await page.goto(BRAVE_ALL_URL);
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);

  await page.keyboard.press('v');
  await page.waitForURL('https://search.brave.com/videos?q=tokyo');
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveAttribute(
    'data-type',
    'videos'
  );

  await page.keyboard.press('n');
  await page.waitForURL('https://search.brave.com/news?q=tokyo');
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveAttribute(
    'data-type',
    'news'
  );

  await page.keyboard.press('i');
  await page.waitForURL('https://search.brave.com/images?q=tokyo');
});

test.describe('image results', () => {
  const BRAVE_IMAGE_URL = 'https://search.brave.com/images?q=tokyo';

  test('Enter on a result without the panel stays on the page', async ({
    page,
  }) => {
    await page.goto(BRAVE_IMAGE_URL);
    const highlighted = page.locator(HIGHLIGHT_SELECTOR);
    await expect(highlighted).toHaveCount(1);

    await page.keyboard.press('j');
    await expect(highlighted).not.toHaveClass(/(^|\s)selected(\s|$)/);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(page.url()).toBe(BRAVE_IMAGE_URL);
  });

  test('Enter on the result shown in the panel opens the source page', async ({
    page,
  }) => {
    await page.goto(BRAVE_IMAGE_URL);
    const highlighted = page.locator(HIGHLIGHT_SELECTOR);
    await expect(highlighted).toHaveCount(1);
    await expect(highlighted).toHaveClass(/(^|\s)selected(\s|$)/);
    const sourceHref = await page
      .locator('#images-selected-context-menu a.images-selected-title')
      .getAttribute('href');

    await page.keyboard.press('Enter');
    await page.waitForURL(sourceHref!);
  });
});
