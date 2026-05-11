/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, expect } from '@playwright/test';

export default class CartPage {
  async visit(page: Page) {
    await page.goto('checkout/cart');
    await page.waitForLoadState('domcontentloaded');
  }

  async assertApplePayButtonIsInCartSummary(page: Page) {
    await expect(page.locator('.cart-summary #mollie_applepay_minicart')).toBeAttached();
  }

  async openMiniCart(page: Page) {
    await page.waitForResponse(response =>
      response.url().includes('customer/section/load') && response.status() === 200
    );
    await page.locator('#menu-cart-icon').click();
    await expect(page.locator('#cart-drawer')).toBeVisible();
  }

  async assertApplePayButtonIsInMiniCart(page: Page) {
    await expect(page.locator('#cart-drawer #mollie_applepay_minicart')).toBeVisible();
  }
}
