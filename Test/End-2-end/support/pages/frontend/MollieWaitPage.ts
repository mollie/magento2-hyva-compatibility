/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, Request, expect } from '@playwright/test';

const STATUS_ENDPOINT = /V1\/mollie\/get-order\/by-hash\//;

/**
 * The page starts polling within a second, so a short budget keeps a missing poll from stalling the
 * run for the full test timeout.
 */
const POLL_TIMEOUT = 15000;

/**
 * Shared behaviour of the Mollie wait pages. Both ship a Luma template that bootstraps its polling
 * through RequireJS, which a Hyvä theme does not load, so the compatibility override has to replace
 * them for the page to do anything at all.
 */
export default abstract class MollieWaitPage {
  captureJavascriptErrors(page: Page): string[] {
    const javascriptErrors: string[] = [];
    page.on('pageerror', error => javascriptErrors.push(error.message));

    return javascriptErrors;
  }

  /**
   * Has to be awaited from a promise created before navigating, otherwise the request can fire
   * before the listener is attached.
   */
  expectStatusPoll(page: Page): Promise<Request> {
    return page.waitForRequest(STATUS_ENDPOINT, { timeout: POLL_TIMEOUT });
  }

  async stubOrderStatus(page: Page, status: string) {
    await page.route(STATUS_ENDPOINT, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, increment_id: '1', created_at: '', grand_total: 10, status }]),
      }),
    );
  }

  async assertStatusIsRendered(page: Page) {
    await expect(page.locator('#mollie-order-status')).toBeVisible();
  }

  async assertNoJavascriptErrors(javascriptErrors: string[]) {
    expect(javascriptErrors, 'the wait page must not raise javascript errors').toEqual([]);
  }

  async assertLumaRequireJsBootstrapIsNotUsed(page: Page) {
    const usesRequireJs = await page.evaluate(() =>
      [...document.querySelectorAll('script:not([src])')].some(script => script.textContent?.includes('require([')),
    );

    expect(usesRequireJs, 'the wait page must not bootstrap through RequireJS').toBe(false);
  }

  protected async visit(page: Page, url: string) {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
  }
}
