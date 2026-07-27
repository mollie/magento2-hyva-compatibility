/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { APIRequestContext, request } from '@playwright/test';

const restBaseUrl = (baseURL: string): string => new URL(baseURL).origin;

/**
 * Multi-store installs need the store code in the path so the order is created on the same store
 * view the browser visits. Single-store installs leave STORE_CODE unset.
 */
const storePath = (): string => (process.env.STORE_CODE ? `/${process.env.STORE_CODE}` : '');

const restPrefix = (): string => `/rest${storePath()}/V1`;

const graphqlUrl = (): string => `${storePath()}/graphql`;

const GUEST_EMAIL = 'janjanssen@mollie.com';

/**
 * Mirrors Test/End-2-end/fixtures/dutch-shipping-address.json in mollie/magento2, translated from
 * that fixture's form-filling shape into the shape the REST cart endpoints expect.
 */
const ADDRESS = {
  country_id: 'NL',
  street: ['Doorzonwoning 34A'],
  postcode: '1234AB',
  city: 'VinexStad',
  firstname: 'Jan',
  lastname: 'Janssen',
  telephone: '0201234567',
  email: GUEST_EMAIL,
};

export type PendingOrder = {
  orderId: string;
  paymentToken: string;
};

const call = async (
  context: APIRequestContext,
  method: 'get' | 'post',
  url: string,
  description: string,
  data?: object,
): Promise<any> => {
  const response = await context[method](url, data === undefined ? {} : { data });

  if (!response.ok()) {
    throw new Error(`${description} failed (HTTP ${response.status()}): ${await response.text()}`);
  }

  return response.json();
};

const newContext = (baseURL: string) =>
  request.newContext({ baseURL: restBaseUrl(baseURL), ignoreHTTPSErrors: true });

/**
 * A Hyvä theme without a checkout module renders "No Checkout module installed" on /checkout, so
 * the cart is built over REST rather than through the storefront.
 */
const buildGuestCart = async (context: APIRequestContext, sku: string): Promise<string> => {
  const cartId = await call(context, 'post', `${restPrefix()}/guest-carts`, 'Creating a guest cart');

  await call(context, 'post', `${restPrefix()}/guest-carts/${cartId}/items`, `Adding "${sku}" to the cart`, {
    cartItem: { sku, qty: 1, quote_id: cartId },
  });

  await call(
    context,
    'post',
    `${restPrefix()}/guest-carts/${cartId}/shipping-information`,
    'Setting the shipping information',
    {
      addressInformation: {
        shipping_address: ADDRESS,
        billing_address: ADDRESS,
        shipping_carrier_code: 'flatrate',
        shipping_method_code: 'flatrate',
      },
    },
  );

  return cartId;
};

/**
 * Generated against the cart; Mollie's AttachPaymentTokenToOrder observer links it to the order on
 * submit, which is what makes it usable as the payment_token request parameter.
 */
const requestPaymentToken = (context: APIRequestContext, cartId: string): Promise<string> =>
  call(
    context,
    'get',
    `${restPrefix()}/guest-carts/${cartId}/mollie/payment-token`,
    'Requesting a Mollie payment token',
  );

const placeOrder = (
  context: APIRequestContext,
  cartId: string,
  method: string,
  additionalData?: object,
): Promise<number> =>
  call(context, 'post', `${restPrefix()}/guest-carts/${cartId}/payment-information`, 'Placing the order', {
    email: GUEST_EMAIL,
    paymentMethod: additionalData ? { method, additional_data: additionalData } : { method },
  });

/**
 * Terminals come from the Mollie account rather than from configuration, so they are discovered at
 * runtime instead of being hard-coded. Returns null when the account has no active terminal.
 */
export const findPointOfSaleTerminal = async (
  context: APIRequestContext,
  cartId: string,
): Promise<string | null> => {
  const response = await context.post(graphqlUrl(), {
    headers: process.env.STORE_CODE ? { Store: process.env.STORE_CODE } : {},
    data: {
      query: `{ cart(cart_id: "${cartId}") {
        available_payment_methods { code mollie_available_terminals { id } }
      } }`,
    },
  });

  const methods = (await response.json())?.data?.cart?.available_payment_methods ?? [];
  const pointOfSale = methods.find((method: any) => method.code === 'mollie_methods_pointofsale');

  return pointOfSale?.mollie_available_terminals?.[0]?.id ?? null;
};

/**
 * Builds an order that Mollie still reports as "open", which is the only state that sends the
 * customer to mollie/checkout/processingwait. The Mollie payment is created through the REST API
 * and deliberately left unpaid, so no hosted payment page interaction is needed.
 */
export const createOrderAwaitingConfirmation = async (
  baseURL: string,
  sku: string,
  method: string = 'mollie_methods_ideal',
): Promise<PendingOrder> => {
  const context = await newContext(baseURL);

  try {
    const cartId = await buildGuestCart(context, sku);
    const paymentToken = await requestPaymentToken(context, cartId);
    const orderId = await placeOrder(context, cartId, method);

    // Creates the payment on Mollie's side so the order has a transaction to report on. The
    // returned checkout url is intentionally never visited, leaving the payment "open".
    await call(context, 'post', `${restPrefix()}/mollie/transaction/start`, 'Starting the Mollie transaction', {
      token: paymentToken,
    });

    return { orderId: String(orderId), paymentToken };
  } finally {
    await context.dispose();
  }
};

/**
 * Builds a point-of-sale order. The transaction is deliberately NOT started here: the browser hits
 * mollie/checkout/redirect instead, because only Service/Mollie/Order/RedirectUrl routes a
 * point-of-sale order without a checkout url to the wait page.
 *
 * Returns null when the Mollie account has no active terminal, so the caller can skip.
 */
export const createPointOfSaleOrder = async (baseURL: string, sku: string): Promise<PendingOrder | null> => {
  const context = await newContext(baseURL);

  try {
    const cartId = await buildGuestCart(context, sku);

    const terminal = await findPointOfSaleTerminal(context, cartId);
    if (terminal === null) {
      return null;
    }

    const paymentToken = await requestPaymentToken(context, cartId);
    const orderId = await placeOrder(context, cartId, 'mollie_methods_pointofsale', {
      selected_terminal: terminal,
    });

    return { orderId: String(orderId), paymentToken };
  } finally {
    await context.dispose();
  }
};

/**
 * The url Mollie sends the customer back to, mirroring Service/Order/Transaction.php.
 */
export const returnUrlFor = (order: PendingOrder): string =>
  `mollie/checkout/process?order_id=${order.orderId}&payment_token=${order.paymentToken}&utm_nooverride=1`;

/**
 * The url the checkout sends the customer to after placing the order.
 */
export const redirectUrlFor = (order: PendingOrder): string =>
  `mollie/checkout/redirect?paymentToken=${order.paymentToken}`;
