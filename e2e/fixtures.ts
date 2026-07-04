import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';

const extensionPath = fileURLToPath(new URL('../dist', import.meta.url));

/**
 * Test fixtures that launch Chromium with the built extension loaded.
 * Extensions require a persistent context; `channel: 'chromium'` selects the
 * full browser whose new headless mode supports extensions.
 */
export const test = base.extend<{ context: BrowserContext }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});

export const expect = test.expect;
