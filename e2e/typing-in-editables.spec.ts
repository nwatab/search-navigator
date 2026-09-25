import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { HIGHLIGHT_SELECTOR, serveFixtures } from './helpers';

// Regression tests for a Chrome Web Store review (2026-09-10): pressing Enter
// to send a message in Google's AI Overview follow-up box opened the
// highlighted result instead, cancelling the message. Shortcuts must stay
// inert while the user types in any editable, whatever the page does with
// focus while handling the same keystroke.

const GOOGLE_ALL_URL =
  'https://www.google.com/search?q=github+closes+comment+pr';

test.beforeEach(async ({ context }) => {
  await serveFixtures(context, {
    'https://www.google.com/search': '20250529_all_tokyo_10.html',
  });
});

const loadResultsPage = async (page: Page): Promise<string> => {
  await page.goto(GOOGLE_ALL_URL);
  const highlighted = page.locator(HIGHLIGHT_SELECTOR);
  await expect(highlighted).toHaveCount(1);
  const href = await highlighted
    .locator('a[href]')
    .first()
    .getAttribute('href');
  expect(href).toMatch(/^https?:\/\//);
  return href!;
};

const expectEnterToStayOnPage = async (page: Page): Promise<void> => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  expect(page.url()).toBe(GOOGLE_ALL_URL);
};

test('Enter in a textarea sends nothing to the extension, even when the page moves focus while handling the keystroke', async ({
  page,
}) => {
  const firstResultHref = await loadResultsPage(page);
  await page.evaluate(() => {
    // Stand-in for the AI Overview "Ask anything" box. Like the real page it
    // handles Enter itself; here it also blurs the box while doing so, which
    // used to fool a check based on document.activeElement alone.
    const box = document.createElement('textarea');
    box.id = 'ask-box';
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        box.blur();
      }
    });
    document.body.prepend(box);
  });
  await page.focus('#ask-box');
  await page.keyboard.type('jk');
  await expectEnterToStayOnPage(page);
  await expect(page.locator('#ask-box')).toHaveValue('jk');

  // Focus has left the box, so Enter opens the highlighted result again.
  await expect(page.locator(HIGHLIGHT_SELECTOR)).toHaveCount(1);
  await page.keyboard.press('Enter');
  await page.waitForURL(firstResultHref);
});

test('Enter in a contenteditable text box does not open the highlighted result', async ({
  page,
}) => {
  await loadResultsPage(page);
  await page.evaluate(() => {
    const box = document.createElement('div');
    box.id = 'ask-box';
    box.setAttribute('contenteditable', 'true');
    box.setAttribute('role', 'textbox');
    document.body.prepend(box);
  });
  await page.focus('#ask-box');
  await page.keyboard.type('jk');
  await expectEnterToStayOnPage(page);
  await expect(page.locator('#ask-box')).toContainText('jk');
});

test('Enter in a textarea inside an open shadow root does not open the highlighted result', async ({
  page,
}) => {
  await loadResultsPage(page);
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'ask-host';
    const shadow = host.attachShadow({ mode: 'open' });
    const box = document.createElement('textarea');
    box.id = 'ask-box';
    shadow.appendChild(box);
    document.body.prepend(host);
    box.focus();
  });
  await page.keyboard.type('jk');
  await expectEnterToStayOnPage(page);
  // Enter reached the textarea itself and inserted a newline.
  await expect(page.locator('#ask-host textarea')).toHaveValue('jk\n');
});
