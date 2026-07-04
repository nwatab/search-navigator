import type { BrowserContext } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fixturesDir = fileURLToPath(
  new URL('../__tests__/htmls', import.meta.url)
);

/** Selector matching the extension's highlighted result in either theme. */
export const HIGHLIGHT_SELECTOR = '.sn-selected-light, .sn-selected-dark';

/**
 * Strip <script> tags from a saved page so the page's own bundled JavaScript
 * does not run against the snapshot; the extension's content script is
 * injected separately by the browser and is unaffected.
 */
const stripScripts = (html: string): string =>
  html.replace(/<script\b[\s\S]*?<\/script>/gi, '');

/**
 * Serve saved-page fixtures for matching document URLs and block all other
 * requests, so tests are deterministic and never hit the network.
 * Non-matching document navigations receive a small placeholder page, which
 * lets tests assert on navigation targets (e.g. after pressing Enter).
 */
export const serveFixtures = async (
  context: BrowserContext,
  fixtureByUrlPrefix: Record<string, string>
): Promise<void> => {
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (request.resourceType() !== 'document') {
      return route.abort();
    }
    const url = request.url();
    const entry = Object.entries(fixtureByUrlPrefix).find(([prefix]) =>
      url.startsWith(prefix)
    );
    if (!entry) {
      return route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: '<!doctype html><title>placeholder</title>',
      });
    }
    const html = await fs.readFile(path.join(fixturesDir, entry[1]), 'utf8');
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: stripScripts(html),
    });
  });
};
