import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

const YOUTUBE_RESULTS_URL =
  'https://www.youtube.com/results?search_query=prokofiev+piano+concerto+3';

const titleOfHighlighted = async (page: {
  locator: (selector: string) => {
    first: () => {
      evaluate: <R>(fn: (el: Element) => R) => Promise<R>;
    };
  };
}) =>
  page
    .locator(HIGHLIGHT_SELECTOR)
    .first()
    .evaluate(
      (el) =>
        el.querySelector('#video-title')?.textContent?.trim() ??
        el.textContent?.trim().slice(0, 80) ??
        ''
    );

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.youtube.com/results':
      '20250620-youtube-search-result-prokofiev-piano-concerto-3-tokyo.html',
  });
});

test('navigates YouTube results with j and k', async ({ page }) => {
  await page.goto(YOUTUBE_RESULTS_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);

  const first = await titleOfHighlighted(page);
  await page.keyboard.press('j');
  await expect(highlighted).toHaveCount(1);
  const second = await titleOfHighlighted(page);
  expect(second).not.toBe(first);

  await page.keyboard.press('k');
  await expect(highlighted).toHaveCount(1);
  expect(await titleOfHighlighted(page)).toBe(first);
});

test('keeps exactly one active listener across SPA navigations', async ({
  page,
}) => {
  await page.goto(YOUTUBE_RESULTS_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);

  const first = await titleOfHighlighted(page);
  await page.keyboard.press('j');
  const second = await titleOfHighlighted(page);
  expect(second).not.toBe(first);

  // Simulate YouTube SPA navigation, which re-runs the extension's init().
  await page.evaluate(() =>
    document.dispatchEvent(new Event('yt-navigate-finish'))
  );
  // Re-init highlights the first result again.
  await expect(
    page.locator(HIGHLIGHT_SELECTOR).filter({ hasText: first })
  ).toHaveCount(1);

  // One keypress must move the highlight exactly one step; with stale
  // listeners piling up (issue #73) it would move several results at once
  // and leave multiple highlights behind.
  await page.keyboard.press('j');
  await expect(highlighted).toHaveCount(1);
  expect(await titleOfHighlighted(page)).toBe(second);
});
