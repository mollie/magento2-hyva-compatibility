/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test } from '@playwright/test';
import FrontendLogin from 'Pages/frontend/FrontendLogin';
import AccountSavedCardsPage from 'Pages/frontend/AccountSavedCardsPage';

const frontendLogin = new FrontendLogin();
const savedCardsPage = new AccountSavedCardsPage();

test.beforeEach(async ({ page }) => {
  const email = `mollie-test-${Date.now()}@example.com`;
  await frontendLogin.register(page, email, 'MollieTest1!');
});

test('Validate that the saved cards nav link is visible in the customer account', async ({ page }) => {
  await savedCardsPage.assertNavLinkIsVisible(page);
});

test('Validate that the saved cards page renders the empty state for a customer with no cards', async ({ page }) => {
  await savedCardsPage.visit(page);
  await savedCardsPage.assertPageIsVisible(page);
  await savedCardsPage.assertHasNoCards(page);
});

