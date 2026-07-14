import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';
import type { BrowserContext } from '@playwright/test';

const GOOGLE_ALL_URL = 'https://www.google.com/search?q=github+closes+comment+pr';
const TOAST = '#sn-rate-prompt';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.google.com/search': '20250529_all_tokyo_10.html',
  });
});

const serviceWorker = async (context: BrowserContext) => {
  const [existing] = context.serviceWorkers();
  return existing ?? (await context.waitForEvent('serviceworker'));
};

const seedRatingState = async (
  context: BrowserContext,
  state: { opens: number; status: string }
) => {
  const sw = await serviceWorker(context);
  await sw.evaluate(
    (s) =>
      new Promise<void>((resolve) =>
        chrome.storage.sync.set({ rating_state: s }, () => resolve())
      ),
    state
  );
};

const persistedStatus = async (context: BrowserContext) => {
  const sw = await serviceWorker(context);
  return sw.evaluate(
    () =>
      new Promise<string | undefined>((resolve) =>
        chrome.storage.sync.get('rating_state', (r) =>
          resolve(r.rating_state?.status)
        )
      )
  );
};

test('shows the rating prompt once past the threshold, then never again if ignored', async ({
  context,
  page,
}) => {
  await seedRatingState(context, { opens: 15, status: 'pending' });

  await page.goto(GOOGLE_ALL_URL);
  await expect(page.locator(TOAST)).toBeVisible();

  // Showing the prompt must immediately mark it resolved, so that ignoring it
  // (no click) never re-shows it on the next page load.
  await expect.poll(() => persistedStatus(context)).toBe('dismissed');

  await page.reload();
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1); // init ran
  await expect(page.locator(TOAST)).toHaveCount(0);
});

test('never shows once the user has rated', async ({ context, page }) => {
  await seedRatingState(context, { opens: 30, status: 'rated' });

  await page.goto(GOOGLE_ALL_URL);
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1); // init ran
  await expect(page.locator(TOAST)).toHaveCount(0);
});
