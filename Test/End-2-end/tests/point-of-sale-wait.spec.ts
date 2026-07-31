/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '../support/fixtures';
import PointOfSaleWaitPage from 'Pages/frontend/PointOfSaleWaitPage';

/*
 * mollie/checkout/pointofsale is shown after placing a point-of-sale order, while the customer pays
 * on the terminal. The stock template drives its polling through RequireJS, which a Hyvä theme does
 * not ship. Mollie_HyvaCheckout ships a Magewire replacement but disables itself when Hyva_Checkout
 * is absent, so on a Hyvä theme with any other checkout this page is inert without the override.
 *
 * Point of sale needs an active terminal on the Mollie account; the tests skip when there is none.
 */

const pointOfSaleWaitPage = new PointOfSaleWaitPage();

test('Validate that placing a point-of-sale order shows the wait page', async ({ page, pointOfSaleOrder }) => {
  test.skip(pointOfSaleOrder === null, 'The Mollie account has no active terminal');

  await pointOfSaleWaitPage.placeOrderAndFollowRedirect(page, pointOfSaleOrder!);

  await pointOfSaleWaitPage.assertIsShown(page);
  await pointOfSaleWaitPage.assertStatusIsRendered(page);
});

test('Validate that the point-of-sale wait page polls the order status', async ({ page, pointOfSaleOrder }) => {
  test.skip(pointOfSaleOrder === null, 'The Mollie account has no active terminal');

  const javascriptErrors = pointOfSaleWaitPage.captureJavascriptErrors(page);
  const statusPoll = pointOfSaleWaitPage.expectStatusPoll(page);

  await pointOfSaleWaitPage.placeOrderAndFollowRedirect(page, pointOfSaleOrder!);

  await statusPoll;
  await pointOfSaleWaitPage.assertNoJavascriptErrors(javascriptErrors);
});

test('Validate that the point-of-sale wait page offers a retry when the payment is canceled', async ({
  page,
  pointOfSaleOrder,
}) => {
  test.skip(pointOfSaleOrder === null, 'The Mollie account has no active terminal');

  await pointOfSaleWaitPage.stubOrderStatus(page, 'canceled');

  await pointOfSaleWaitPage.placeOrderAndFollowRedirect(page, pointOfSaleOrder!);

  await pointOfSaleWaitPage.assertRetryIsOffered(page);
});

test('Validate that the point-of-sale wait page does not load the Luma assets', async ({
  page,
  pointOfSaleOrder,
}) => {
  test.skip(pointOfSaleOrder === null, 'The Mollie account has no active terminal');

  await pointOfSaleWaitPage.placeOrderAndFollowRedirect(page, pointOfSaleOrder!);

  await pointOfSaleWaitPage.assertLumaRequireJsBootstrapIsNotUsed(page);
  await pointOfSaleWaitPage.assertMollieLumaCssIsNotLoaded(page);
});
