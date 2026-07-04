import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

// Snapshot of an All-tab page after infinite scroll loaded extra results:
// 7 results live in #rso and 4 more in #botstuff (issue #76).
const GOOGLE_ALL_URL = 'https://www.google.com/search?q=something';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.google.com/search': '20250807_all_usa_14.html',
  });
});

test('navigates into infinite-scroll results inside #botstuff', async ({
  page,
}) => {
  await page.goto(GOOGLE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);

  // 11 results in total; walk down to the last one.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('j');
  }
  await expect(highlighted).toHaveCount(1);

  const isInBotstuff = await highlighted.first().evaluate((el) => {
    return el.closest('#botstuff') !== null;
  });
  expect(isInBotstuff).toBe(true);

  // Walking back up returns to the #rso results.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('k');
  }
  await expect(highlighted).toHaveCount(1);
  const isInRso = await highlighted.first().evaluate((el) => {
    return el.closest('#rso') !== null;
  });
  expect(isInRso).toBe(true);
});
