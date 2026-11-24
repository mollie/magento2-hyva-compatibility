/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, expect } from '@playwright/test';

export type ApplePayShippingContact = {
  countryCode?: string;
  postalCode?: string;
};

export type ApplePayContactError = {
  code: string;
  contactField: string;
  message: string;
};

export type RecordedApplePayCall = {
  method: string;
  args: unknown[];
};

export const APPLE_PAY_STATUS_SUCCESS = 0;

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
    await this.installFakeApplePaySession(page, null);
  }

  async stubApplePaySessionSelectingShippingContact(page: Page, shippingContact: ApplePayShippingContact) {
    await this.installFakeApplePaySession(page, shippingContact);
  }

  private async installFakeApplePaySession(page: Page, shippingContact: ApplePayShippingContact | null) {
    await page.addInitScript((contact: ApplePayShippingContact | null) => {
      const calls: { method: string; args: unknown[] }[] = [];
      // @ts-expect-error Exposed so the test can read what the frontend told Apple Pay.
      window.__mollieApplePayCalls = calls;

      class FakeApplePaySession {
        static readonly STATUS_SUCCESS = 0;
        static readonly STATUS_FAILURE = 1;
        static readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS = 2;
        static readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS = 3;
        static readonly STATUS_INVALID_SHIPPING_CONTACT = 4;

        onvalidatemerchant?: (event: { validationURL: string }) => void;
        onshippingcontactselected?: (event: { shippingContact: ApplePayShippingContact }) => void;
        onshippingmethodselected?: (event: { shippingMethod: unknown }) => void;

        static canMakePayments() {
          return true;
        }

        begin() {
          this.onvalidatemerchant?.({ validationURL: 'https://apple-pay-gateway.test/validate' });
        }

        completeMerchantValidation(...args: unknown[]) {
          calls.push({ method: 'completeMerchantValidation', args });

          if (contact !== null) {
            this.onshippingcontactselected?.({ shippingContact: contact });
          }
        }

        completeShippingContactSelection(...args: unknown[]) {
          calls.push({ method: 'completeShippingContactSelection', args });

          const [status, shippingMethods] = args;
          if (status === FakeApplePaySession.STATUS_SUCCESS && Array.isArray(shippingMethods) && shippingMethods.length > 0) {
            setTimeout(() => this.onshippingmethodselected?.({ shippingMethod: shippingMethods[0] }));
          }
        }

        completeShippingMethodSelection(...args: unknown[]) {
          calls.push({ method: 'completeShippingMethodSelection', args });
        }

        completePayment(...args: unknown[]) {
          calls.push({ method: 'completePayment', args });
        }

        abort() {
          calls.push({ method: 'abort', args: [] });
        }
      }

      class FakeApplePayError {
        constructor(
          public readonly code: string,
          public readonly contactField: string,
          public readonly message: string,
        ) {}
      }

      // @ts-expect-error Chromium has no native Apple Pay, so we provide a stub.
      window.ApplePaySession = FakeApplePaySession;
      // @ts-expect-error Chromium has no native Apple Pay, so we provide a stub.
      window.ApplePayError = FakeApplePayError;
    }, shippingContact);
  }

  async answerBuyNowValidationWithCart(page: Page, cartId: string) {
    await page.route('**/mollie/applePay/buyNowValidation*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ cartId, validationData: {} }),
    }));
  }

  async answerShippingMethodSelectionWithInvalidContact(page: Page, message: string) {
    await page.route('**/mollie/applePay/shippingMethods*', route => {
      if (!(route.request().postData() ?? '').includes('shippingMethod')) {
        return route.continue();
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ shipping_methods: [], totals: [], invalid_shipping_contact: true, message }),
      });
    });
  }

  async waitForShippingContactOutcome(page: Page): Promise<RecordedApplePayCall> {
    return this.waitForFirstCall(page, ['completeShippingContactSelection', 'abort']);
  }

  async waitForShippingMethodOutcome(page: Page): Promise<RecordedApplePayCall> {
    return this.waitForFirstCall(page, ['completeShippingMethodSelection', 'abort']);
  }

  private async waitForFirstCall(page: Page, methods: string[]): Promise<RecordedApplePayCall> {
    const isOutcome = (call: RecordedApplePayCall) => methods.includes(call.method);

    await expect.poll(async () => (await this.recordedApplePayCalls(page)).some(isOutcome)).toBe(true);

    return (await this.recordedApplePayCalls(page)).find(isOutcome)!;
  }

  private async recordedApplePayCalls(page: Page): Promise<RecordedApplePayCall[]> {
    // @ts-expect-error Set by the fake Apple Pay session.
    return page.evaluate(() => window.__mollieApplePayCalls ?? []);
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
