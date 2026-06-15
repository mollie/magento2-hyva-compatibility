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

  async stubApplePaySession(page: Page) {
    await page.addInitScript(() => {
      class FakeApplePaySession {
        static readonly STATUS_SUCCESS = 0;
        static readonly STATUS_FAILURE = 1;

        onvalidatemerchant?: (event: { validationURL: string }) => void;

        static canMakePayments() {
          return true;
        }

        begin() {
          this.onvalidatemerchant?.({ validationURL: 'https://apple-pay-gateway.test/validate' });
        }

        completeMerchantValidation() {}
        completeShippingContactSelection() {}
        completeShippingMethodSelection() {}
        completePayment() {}
        abort() {}
      }

      // @ts-expect-error Chromium has no native Apple Pay, so we provide a stub.
      window.ApplePaySession = FakeApplePaySession;
    });
  }

  captureBuyNowValidationBody(page: Page): Promise<string> {
    return new Promise<string>(resolve => {
      page.route('**/mollie/applePay/buyNowValidation*', async route => {
        const body = route.request().postData() ?? '';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ cartId: 'e2e-test-cart', validationData: {} }),
        });
        resolve(body);
      });
    });
  }

  async selectFirstAvailableVariant(page: Page) {
    const selectedOptions = await page.evaluate(() => {
      const form = document.getElementById('product_addtocart_form');
      if (form === null) {
        return 0;
      }

      const seenAttributes = new Set<string>();
      form
        .querySelectorAll<HTMLInputElement>('input[type="radio"][name^="super_attribute"]')
        .forEach(radio => {
          if (seenAttributes.has(radio.name)) {
            return;
          }

          seenAttributes.add(radio.name);
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          radio.dispatchEvent(new Event('input', { bubbles: true }));
        });

      return seenAttributes.size;
    });

    expect(selectedOptions, 'expected the product to expose configurable options').toBeGreaterThan(0);
  }

  async startApplePayPayment(page: Page) {
    await page.locator('#product-page-mollie-apple-pay-button > div').first().dispatchEvent('click');
  }
}
