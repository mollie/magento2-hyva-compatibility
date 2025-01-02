<p align="center">
  <img src="./images/hyva-mollie-header.jpg" />
</p>

# General Hyvä Compatibility for Mollie
Hyvä Themes Magento 2 frontend offers the best performance and user experience, without the cost and overhead of a PWA.

## About Mollie Payments
With Mollie, you can accept payments and donations online and expand your customer base internationally with support for all major payment methods through a single integration. No need to spend weeks on paperwork or security compliance procedures. No more lost conversions because you don’t support a shopper’s favourite payment method or because they don’t feel safe. We made our products and API expansive, intuitive, and safe for merchants, customers and developers alike.

Mollie requires no minimum costs, no fixed contracts, no hidden costs. At Mollie you only pay for successful transactions. More about this pricing model can be found here. You can create an account here. The Mollie Magento 2 plugin quickly integrates all major payment methods ready-made into your Magento webshop.

## About this repository

This repository hold the module to add support for Mollie to Hyvä. This module has a dependency on the Mollie Magento 2 module.

If you are using the **Hyvä Checkout** module, we have a separate repository for that:
https://github.com/mollie/magento2-hyva-checkout

If you are using the **Hyvä React Checkout** module, we have a separate repository for that:
https://github.com/mollie/magento2-hyva-react-checkout

## Installation

1. Install the module using composer: 

```bash
composer require mollie/magento2-hyva-compatibility
```

2. Enable the module:

```bash
bin/magento module:enable Mollie_HyvaCompatibility
```

3. Upgrade the database:

```bash
bin/magento setup:upgrade
```

4. Let Hyvä know about the new module:

```bash
php bin/magento hyva:config:generate
```

5. Generate the CSS files:

```bash
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run ci
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run build-prod
```

Or from your theme:

```bash
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run ci
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run build-prod
```

## Missing styles?

Make sure that PostCSS uses the `postcssImportHyvaModules` plugin in your theme:

1. Go to your theme folder: `app/design/frontend/<Vendor>/<Theme>/web/tailwind`
2. Install the module:
```bash
npm install --save-dev @hyva-themes/hyva-modules
```
3. Open your `postcss.config.js` and add this as the first line:
```js
const { postcssImportHyvaModules } = require("@hyva-themes/hyva-modules");
```
4. Make sure the plugin is includes in the plugins list:
```js
module.exports = {
    plugins: [
        postcssImportHyvaModules,
        // ...
    ],
};
```
