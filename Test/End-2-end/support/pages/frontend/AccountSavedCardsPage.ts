/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Page, expect } from '@playwright/test';

export default class AccountSavedCardsPage {
  async visit(page: Page) {
    await page.goto('mollie/savedcards/index');
    await page.waitForLoadState('domcontentloaded');
  }

  async assertPageIsVisible(page: Page) {
    await expect(page).toHaveURL(/mollie\/savedcards/);
    await expect(page.locator('.page-title')).toBeVisible();
  }

  async assertNavLinkIsVisible(page: Page) {
    await page.goto('customer/account');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('link', { name: 'Saved cards' })).toBeVisible();
  }

  async assertHasNoCards(page: Page) {
    await expect(page.locator('.message.info.empty')).toBeVisible();
    await expect(page.locator('.message.info.empty')).toContainText('You have no saved cards.');
  }

}
