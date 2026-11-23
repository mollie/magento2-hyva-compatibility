/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '../support/fixtures';
import ProductPage from 'Pages/frontend/ProductPage';
import ExpressComponentsPage from 'Pages/frontend/ExpressComponentsPage';

/*
 * The product page placement needs the shipping options beta, which configure-mollie.sh enables. The session is
 * created from the add to cart form, so the cart stays empty.
 */

const productPage = new ProductPage();
const expressComponentsPage = new ExpressComponentsPage();

test('Validate that the product page creates an Express Components session', async ({ page, simpleProductId }) => {
  const session = expressComponentsPage.expectProductSession(page);

  await productPage.visit(page, simpleProductId);

  await expressComponentsPage.assertSessionHasClientAccessToken(await session);
});

test('Validate that the product page mounts the Express Component', async ({ page, simpleProductId }) => {
  await productPage.visit(page, simpleProductId);

  await expressComponentsPage.assertIsMountedOnProductPage(page);
});
