/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test, expect } from '../support/fixtures';
import ProductPage, {
  ApplePayContactError,
  ApplePayShippingContact,
  APPLE_PAY_STATUS_SUCCESS,
} from 'Pages/frontend/ProductPage';

const productPage = new ProductPage();

test('Validate that the Apple Pay button is rendered on the product page', async ({ page, simpleProductId }) => {
  await productPage.visit(page, simpleProductId);

  await productPage.assertApplePayButtonIsPresent(page);
});

test('Validate that the Mollie Luma CSS is not loaded on the product page', async ({ page, simpleProductId }) => {
  await productPage.visit(page, simpleProductId);

  await productPage.assertMollieLumaCssIsNotLoaded(page);
});

/*
 * Chromium has no native Apple Pay, so the real button (-apple-pay-button appearance) renders with
 * no clickable area and ApplePaySession is undefined. We stub ApplePaySession before the page loads
 * and dispatch the click event directly, which is enough to exercise the onvalidatemerchant handler
 * that issue #47 is about: it must POST the full add-to-cart form (including super_attribute) to
 * buyNowValidation, not a hard-coded {product, validationURL}.
 */
test('Validate that the Apple Pay button sends the selected variant for a configurable product', async ({ page, configurableProductId }) => {
  await productPage.stubApplePaySession(page);
  const buyNowValidationBody = productPage.captureBuyNowValidationBody(page);

  await productPage.visit(page, configurableProductId);
  await productPage.selectFirstAvailableVariant(page);
  await productPage.startApplePayPayment(page);

  const body = await buyNowValidationBody;

  expect(body).toContain(`product=${configurableProductId}`);
  expect(body).toContain('super_attribute');
});

/*
 * Issue mollie/magento2#1127: when Apple Wallet has no address for the contact yet, the shipping contact
 * event arrives without a country code. The real shippingMethods controller is called with a real guest
 * cart, so this covers both the backend response and how the frontend hands it back to Apple Pay.
 */
test('Validate that the Apple Pay sheet stays open with a valid shipping contact', async ({ page, simpleProductId, guestCartWithSimpleProduct }) => {
  await productPage.stubApplePaySessionSelectingShippingContact(page, { countryCode: 'NL', postalCode: '1012AB' });
  await productPage.answerBuyNowValidationWithCart(page, guestCartWithSimpleProduct);

  await productPage.visit(page, simpleProductId);
  await productPage.startApplePayPayment(page);
  const outcome = await productPage.waitForShippingContactOutcome(page);

  expect(outcome.method).toBe('completeShippingContactSelection');
  expect(outcome.args[0]).toBe(APPLE_PAY_STATUS_SUCCESS);
});

const contactsWithoutAnAddress: { name: string; contact: ApplePayShippingContact }[] = [
  { name: 'empty fields', contact: { countryCode: '', postalCode: '' } },
  { name: 'missing fields', contact: {} },
];

for (const { name, contact } of contactsWithoutAnAddress) {
  test(`Validate that the Apple Pay sheet asks for a shipping address when the contact has ${name}`, async ({ page, simpleProductId, guestCartWithSimpleProduct }) => {
    await productPage.stubApplePaySessionSelectingShippingContact(page, contact);
    await productPage.answerBuyNowValidationWithCart(page, guestCartWithSimpleProduct);

    await productPage.visit(page, simpleProductId);
    await productPage.startApplePayPayment(page);
    const outcome = await productPage.waitForShippingContactOutcome(page);

    expect(outcome.method).toBe('completeShippingContactSelection');
    const update = outcome.args[0] as { errors: ApplePayContactError[] };
    expect(update.errors).toHaveLength(1);
    expect(update.errors[0].code).toBe('shippingContactInvalid');
    expect(update.errors[0].contactField).toBe('postalAddress');
    expect(update.errors[0].message).not.toBe('');
  });
}

test('Validate that the Apple Pay sheet closes with the server message when the selected shipping method is rejected', async ({ page, simpleProductId, guestCartWithSimpleProduct }) => {
  const message = 'E2E rejected shipping method message';
  await productPage.stubApplePaySessionSelectingShippingContact(page, { countryCode: 'NL', postalCode: '1012AB' });
  await productPage.answerBuyNowValidationWithCart(page, guestCartWithSimpleProduct);
  await productPage.answerShippingMethodSelectionWithInvalidContact(page, message);

  await productPage.visit(page, simpleProductId);
  await productPage.startApplePayPayment(page);
  const outcome = await productPage.waitForShippingMethodOutcome(page);

  expect(outcome.method).toBe('abort');
  await expect(page.getByText(message)).toBeVisible();
});
