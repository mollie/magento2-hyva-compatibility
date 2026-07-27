/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, Request, expect } from '@playwright/test';
import MollieWaitPage from './MollieWaitPage';
import { PendingOrder, returnUrlFor } from '../../mollie-order-rest';

export default class ProcessingWaitPage extends MollieWaitPage {
  expectRedirectToConfirmation(page: Page): Promise<Request> {
    return page.waitForRequest(/mollie\/checkout\/processingwaitredirect/, { timeout: 15000 });
  }

  async returnFromMollie(page: Page, order: PendingOrder) {
    await this.visit(page, returnUrlFor(order));
  }

  async assertIsShown(page: Page) {
    // Magento renders the token as a path segment, but honour a query string too.
    await expect(page).toHaveURL(/mollie\/checkout\/processingwait[/?]token[/=]/);
  }
}
