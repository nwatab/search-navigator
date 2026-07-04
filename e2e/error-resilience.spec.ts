import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

// Regression tests for uncaught errors the extension used to log in
// chrome://extensions (fixed as part of issue #73):
// - "Can't determine search tab type for: .../search/warmup.html"
// - "Unexpected host: https://www.youtube.com/watch?..."
// - "Invalid index provided for highlight"

/**
 * Collect uncaught errors from both the page and its console. Blocked
 * subresources also log console errors ("Failed to load resource"), so only
 * uncaught exceptions are collected there.
 */
const collectErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('Uncaught')) {
      errors.push(msg.text());
    }
  });
  return errors;
};

test('stays silent on Google warmup page without a search query', async ({
  context,
  page,
}) => {
  const errors = collectErrors(page);
  await serveFixtures(context, {});
  // Chrome preloads this URL; it matches the content script pattern but
  // carries no q parameter, so no tab type can be determined.
  await page.goto('https://www.google.com/search/warmup.html');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('stays silent after SPA navigation to a YouTube watch page', async ({
  context,
  page,
}) => {
  const errors = collectErrors(page);
  await serveFixtures(context, {
    'https://www.youtube.com/results':
      '20250620-youtube-search-result-prokofiev-piano-concerto-3-tokyo.html',
  });
  await page.goto('https://www.youtube.com/results?search_query=prokofiev');
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);

  // Simulate YouTube's SPA navigation to a watch page, which re-runs init()
  // on a page type the extension does not support.
  await page.evaluate(() => {
    history.pushState({}, '', '/watch?v=dQw4w9WgXcQ');
    document.dispatchEvent(new Event('yt-navigate-finish'));
  });
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('survives an empty result list and recovers when results appear', async ({
  context,
  page,
}) => {
  const errors = collectErrors(page);
  // A search page whose root exists but holds no results yet, as when
  // results have not been rendered at content-script startup.
  await context.route('**/*', (route) => {
    if (route.request().resourceType() !== 'document') return route.abort();
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html><body><div id="search"><div id="rso"></div></div></body></html>',
    });
  });
  await page.goto('https://www.google.com/search?q=test');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(0);

  // Results stream in later; pressing move-down must pick them up.
  await page.evaluate(() => {
    document.getElementById('rso')!.innerHTML = `
      <div><div><h3>First result</h3><a href="https://example.com/1">1</a></div></div>
      <div><div><h3>Second result</h3><a href="https://example.com/2">2</a></div></div>
    `;
  });
  await page.keyboard.press('j');
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);
  await expect(page.locator(HIGHLIGHT_SELECTOR).locator('h3')).toHaveText(
    'First result'
  );
  expect(errors).toEqual([]);
});
