import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  // Each test launches its own persistent browser context with the extension
  // loaded, so keep them sequential to stay light on resources.
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
});
