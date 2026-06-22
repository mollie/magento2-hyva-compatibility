/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test, expect } from '../support/fixtures';
import ProductPage from 'Pages/frontend/ProductPage';

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
