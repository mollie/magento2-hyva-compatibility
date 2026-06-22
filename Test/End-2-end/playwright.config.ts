/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { defineConfig, devices } from '@playwright/test';
import type { ProductSkus } from './support/fixtures';

export default defineConfig<ProductSkus>({
  testDir: './tests',
  globalSetup: './global-setup.ts',
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
    simpleProductSku: process.env.SIMPLE_PRODUCT_SKU ?? '24-MB05',
    configurableProductSku: process.env.CONFIGURABLE_PRODUCT_SKU ?? 'MH01',
  },
  timeout: 60000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
