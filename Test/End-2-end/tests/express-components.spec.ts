/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '../support/fixtures';
import ProductPage from 'Pages/frontend/ProductPage';
import CartPage from 'Pages/frontend/CartPage';
import ExpressComponentsPage from 'Pages/frontend/ExpressComponentsPage';

/*
 * The cart and minicart Express Components are Alpine components registered with Alpine.data(). On
 * the CSP theme, Alpine does not evaluate expressions in x-data, so a template that calls the
 * component as a function silently gets an empty object and never requests a session.
 */

const productPage = new ProductPage();
const cartPage = new CartPage();
const expressComponentsPage = new ExpressComponentsPage();

test.beforeEach(async ({ page, simpleProductId }) => {
  await productPage.visit(page, simpleProductId);
  await productPage.addToCart(page);
});

test('Validate that the cart page creates an Express Components session', async ({ page }) => {
  const session = expressComponentsPage.expectCartSession(page);

  await cartPage.visit(page);

  await expressComponentsPage.assertSessionHasClientAccessToken(await session);
});

test('Validate that the cart page mounts the Express Component', async ({ page }) => {
  await cartPage.visit(page);

  await expressComponentsPage.assertIsMountedInCart(page);
});

test('Validate that opening the minicart drawer creates an Express Components session', async ({ page }) => {
  const session = expressComponentsPage.expectMinicartSession(page);

  await cartPage.openMiniCart(page);

  await expressComponentsPage.assertSessionHasClientAccessToken(await session);
});

test('Validate that opening the minicart drawer mounts the Express Component', async ({ page }) => {
  await cartPage.openMiniCart(page);

  await expressComponentsPage.assertIsMountedInMinicart(page);
});
