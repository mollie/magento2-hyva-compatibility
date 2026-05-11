/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  maxFailures: process.env.CI ? 3 : undefined,
  reporter: process.env.CI
    ? [['list'], ['blob'], ['html']]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://mollie-hyva.test/',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  timeout: 60000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
