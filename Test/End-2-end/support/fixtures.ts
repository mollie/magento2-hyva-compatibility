/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test as base } from '@playwright/test';
import { getProductIdBySku } from './magento-rest';
import { createOrderAwaitingConfirmation, createPointOfSaleOrder, PendingOrder } from './mollie-order-rest';

export type ProductSkus = {
  simpleProductSku: string;
  configurableProductSku: string;
};

type ResolvedProductIds = {
  simpleProductId: number;
  configurableProductId: number;
};

type MollieOrders = {
  orderAwaitingConfirmation: PendingOrder;
  pointOfSaleOrder: PendingOrder | null;
};

export const test = base.extend<ProductSkus & ResolvedProductIds & MollieOrders>({
  simpleProductSku: ['24-MB05', { option: true }],
  configurableProductSku: ['MH01', { option: true }],

  simpleProductId: async ({ baseURL, simpleProductSku }, use) => {
    await use(await getProductIdBySku(baseURL!, process.env.admin_token!, simpleProductSku));
  },
  configurableProductId: async ({ baseURL, configurableProductSku }, use) => {
    await use(await getProductIdBySku(baseURL!, process.env.admin_token!, configurableProductSku));
  },
  orderAwaitingConfirmation: async ({ baseURL, simpleProductSku }, use) => {
    await use(await createOrderAwaitingConfirmation(baseURL!, simpleProductSku));
  },
  pointOfSaleOrder: async ({ baseURL, simpleProductSku }, use) => {
    await use(await createPointOfSaleOrder(baseURL!, simpleProductSku));
  },
});

export { expect } from '@playwright/test';
