/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '@playwright/test';
import ProductPage from 'Pages/frontend/ProductPage';

const productPage = new ProductPage();

test('Validate that the Apple Pay button is rendered on the product page', async ({ page }) => {
  await productPage.visit(page);

  await productPage.assertApplePayButtonIsPresent(page);
});

test('Validate that the Mollie Luma CSS is not loaded on the product page', async ({ page }) => {
  await productPage.visit(page);

  await productPage.assertMollieLumaCssIsNotLoaded(page);
});
