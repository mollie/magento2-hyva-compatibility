/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '../support/fixtures';
import ProductPage from 'Pages/frontend/ProductPage';
import CartPage from 'Pages/frontend/CartPage';

const productPage = new ProductPage();
const cartPage = new CartPage();

test.beforeEach(async ({ page, simpleProductId }) => {
  await productPage.visit(page, simpleProductId);
  await productPage.addToCart(page);
});

test('Validate that the Apple Pay button is rendered in the cart summary', async ({ page }) => {
  await cartPage.visit(page);

  await cartPage.assertApplePayButtonIsInCartSummary(page);
});

test('Validate that the Apple Pay button is rendered in the minicart drawer', async ({ page }) => {
  await cartPage.openMiniCart(page);

  await cartPage.assertApplePayButtonIsInMiniCart(page);
});
