/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, expect } from '@playwright/test';
import MollieWaitPage from './MollieWaitPage';
import { PendingOrder, redirectUrlFor } from '../../mollie-order-rest';

export default class PointOfSaleWaitPage extends MollieWaitPage {
  /**
   * Starts the transaction through Service/Mollie/Order/RedirectUrl, which is the only path that
   * routes a point-of-sale order to the wait page.
   */
  async placeOrderAndFollowRedirect(page: Page, order: PendingOrder) {
    await this.visit(page, redirectUrlFor(order));
  }

  async assertIsShown(page: Page) {
    await expect(page).toHaveURL(/mollie\/checkout\/pointofsale[/?]token[/=]/);
  }

  async assertRetryIsOffered(page: Page) {
    await expect(page.locator('#mollie-retry-order')).toBeVisible();
  }

  async assertMollieLumaCssIsNotLoaded(page: Page) {
    await expect(page.locator('link[href*="Mollie_Payment/css/styles"]')).not.toBeAttached();
  }
}
