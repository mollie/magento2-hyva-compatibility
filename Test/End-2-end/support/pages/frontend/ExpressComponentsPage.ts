/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, Response, expect } from '@playwright/test';

const CART_SESSION_ENDPOINT = /mollie\/express\/createSession\/type\/cart/;
const MINICART_SESSION_ENDPOINT = /mollie\/express\/createSession\/?(\?|$)/;

/**
 * Mollie.js mounts the component asynchronously after the session is created, so give it a bit
 * longer than the session request itself.
 */
const MOUNT_TIMEOUT = 20000;

/**
 * Express Components has no test mode for placing an order, so these checks stop at the point where
 * the component is mounted: the session request succeeded and Mollie.js rendered into the container.
 */
export default class ExpressComponentsPage {
  /**
   * Has to be awaited from a promise created before the action that triggers the request.
   */
  expectCartSession(page: Page): Promise<Response> {
    return page.waitForResponse(response => CART_SESSION_ENDPOINT.test(response.url()));
  }

  expectMinicartSession(page: Page): Promise<Response> {
    return page.waitForResponse(response => MINICART_SESSION_ENDPOINT.test(response.url()));
  }

  async assertSessionHasClientAccessToken(response: Response) {
    expect(response.status()).toBe(200);
    expect((await response.json()).clientAccessToken, 'the session must return a client access token').toBeTruthy();
  }

  async assertIsMountedInCart(page: Page) {
    await this.assertIsMounted(page, '#express-component-cart');
  }

  async assertIsMountedInMinicart(page: Page) {
    await this.assertIsMounted(page, '#cart-drawer #express-component-minicart');
  }

  private async assertIsMounted(page: Page, container: string) {
    await expect(page.locator(`${container} > *`).first()).toBeAttached({ timeout: MOUNT_TIMEOUT });
  }
}
