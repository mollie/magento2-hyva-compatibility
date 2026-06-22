/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { test as base } from '@playwright/test';
import { getProductIdBySku } from './magento-rest';

export type ProductSkus = {
  simpleProductSku: string;
  configurableProductSku: string;
};

type ResolvedProductIds = {
  simpleProductId: number;
  configurableProductId: number;
};

export const test = base.extend<ProductSkus & ResolvedProductIds>({
  simpleProductSku: ['24-MB05', { option: true }],
  configurableProductSku: ['MH01', { option: true }],

  simpleProductId: async ({ baseURL, simpleProductSku }, use) => {
    await use(await getProductIdBySku(baseURL!, process.env.admin_token!, simpleProductSku));
  },
  configurableProductId: async ({ baseURL, configurableProductSku }, use) => {
    await use(await getProductIdBySku(baseURL!, process.env.admin_token!, configurableProductSku));
  },
});

export { expect } from '@playwright/test';
