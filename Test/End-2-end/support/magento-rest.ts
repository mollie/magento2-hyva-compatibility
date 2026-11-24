/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { request } from '@playwright/test';

const restBaseUrl = (baseURL: string): string => new URL(baseURL).origin;

export const getAdminToken = async (
  baseURL: string,
  username: string,
  password: string,
): Promise<string> => {
  const context = await request.newContext({ ignoreHTTPSErrors: true });
  const response = await context.post(`${restBaseUrl(baseURL)}/rest/all/V1/integration/admin/token`, {
    data: { username, password },
  });

  if (!response.ok()) {
    throw new Error(`Could not retrieve an admin token (HTTP ${response.status()}). Check the admin credentials.`);
  }

  const token = await response.json();
  await context.dispose();

  return token;
};

export const createGuestCartWithProduct = async (
  baseURL: string,
  sku: string,
): Promise<string> => {
  const context = await request.newContext({ ignoreHTTPSErrors: true });
  const cartResponse = await context.post(`${restBaseUrl(baseURL)}/rest/V1/guest-carts`);

  if (!cartResponse.ok()) {
    throw new Error(`Could not create a guest cart (HTTP ${cartResponse.status()}).`);
  }

  const cartId: string = await cartResponse.json();
  const itemResponse = await context.post(`${restBaseUrl(baseURL)}/rest/V1/guest-carts/${cartId}/items`, {
    data: { cartItem: { sku, qty: 1, quote_id: cartId } },
  });

  if (!itemResponse.ok()) {
    throw new Error(`Could not add SKU "${sku}" to guest cart (HTTP ${itemResponse.status()}).`);
  }

  await context.dispose();

  return cartId;
};

export const getProductIdBySku = async (
  baseURL: string,
  token: string,
  sku: string,
): Promise<number> => {
  const context = await request.newContext({ ignoreHTTPSErrors: true });
  const response = await context.get(`${restBaseUrl(baseURL)}/rest/V1/products/${encodeURIComponent(sku)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok()) {
    throw new Error(`Could not resolve product SKU "${sku}" (HTTP ${response.status()}).`);
  }

  const product = await response.json();
  await context.dispose();

  return product.id;
};
