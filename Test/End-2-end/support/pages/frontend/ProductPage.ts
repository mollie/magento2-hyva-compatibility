/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, expect } from '@playwright/test';

export default class ProductPage {
  async visit(page: Page, productId: number = 4) {
    await page.goto(`catalog/product/view/id/${productId}`);
    await page.waitForLoadState('domcontentloaded');
  }

  async addToCart(page: Page) {
    await page.locator('#product-addtocart-button').click();
    await page.waitForLoadState('domcontentloaded');
  }

  async assertApplePayButtonIsPresent(page: Page) {
    await expect(page.locator('#product-page-mollie-apple-pay-button')).toBeAttached();
  }

  async assertMollieLumaCssIsNotLoaded(page: Page) {
    await expect(page.locator('link[href*="Mollie_Payment/css/styles"]')).not.toBeAttached();
  }
}
