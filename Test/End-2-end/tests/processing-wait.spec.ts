/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '../support/fixtures';
import ProcessingWaitPage from 'Pages/frontend/ProcessingWaitPage';

/*
 * mollie/checkout/processingwait is shown when the customer returns while Mollie still reports the
 * payment as "open" (Process.php -> GetMollieStatusResult::isAwaitingConfirmation). The stock
 * template drives its polling through RequireJS, which a Hyvä theme does not ship, so without the
 * compatibility override the page never polls and never redirects.
 */

const processingWaitPage = new ProcessingWaitPage();

test('Validate that returning with an unconfirmed payment shows the processing wait page', async ({
  page,
  orderAwaitingConfirmation,
}) => {
  await processingWaitPage.returnFromMollie(page, orderAwaitingConfirmation);

  await processingWaitPage.assertIsShown(page);
  await processingWaitPage.assertStatusIsRendered(page);
});

test('Validate that the processing wait page polls the order status', async ({
  page,
  orderAwaitingConfirmation,
}) => {
  const javascriptErrors = processingWaitPage.captureJavascriptErrors(page);
  const statusPoll = processingWaitPage.expectStatusPoll(page);

  await processingWaitPage.returnFromMollie(page, orderAwaitingConfirmation);

  await statusPoll;
  await processingWaitPage.assertNoJavascriptErrors(javascriptErrors);
});

test('Validate that the processing wait page redirects once the payment is confirmed', async ({
  page,
  orderAwaitingConfirmation,
}) => {
  await processingWaitPage.stubOrderStatus(page, 'processing');
  const redirect = processingWaitPage.expectRedirectToConfirmation(page);

  await processingWaitPage.returnFromMollie(page, orderAwaitingConfirmation);

  await redirect;
});

test('Validate that the processing wait page does not bootstrap through RequireJS', async ({
  page,
  orderAwaitingConfirmation,
}) => {
  await processingWaitPage.returnFromMollie(page, orderAwaitingConfirmation);

  await processingWaitPage.assertLumaRequireJsBootstrapIsNotUsed(page);
});
