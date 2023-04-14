<p align="center">
  <img src="https://info.mollie.com/hubfs/github/magento-2/logo.png" width="128" height="128"/>
</p>
<h1 align="center">Hyvä support for Mollie</h1>

## About Mollie Payments
With Mollie, you can accept payments and donations online and expand your customer base internationally with support for all major payment methods through a single integration. No need to spend weeks on paperwork or security compliance procedures. No more lost conversions because you don’t support a shopper’s favourite payment method or because they don’t feel safe. We made our products and API expansive, intuitive, and safe for merchants, customers and developers alike.

Mollie requires no minimum costs, no fixed contracts, no hidden costs. At Mollie you only pay for successful transactions. More about this pricing model can be found here. You can create an account here. The Mollie Magento 2 plugin quickly integrates all major payment methods ready-made into your Magento webshop.

## About this repository

This repository holds 2 modules:
- `Mollie_HyvaCompatibility`: This module adds compatibility for the Mollie module with Hyvä.
- `Mollie_HyvaCheckout`: This module adds support for the Hyvä Checkout module.

If you are using the Hyvä React Checkout module, we have a separate repository for that:
https://github.com/mollie/magento2-hyva-react-checkout

## Installation

1. Install the module using composer: 

```bash
composer require mollie/magento2-hyva-compatibility
```

2. Enable both modules:

```bash
bin/magento module:enable Mollie_HyvaCompatibility
bin/magento module:enable Mollie_HyvaCheckout
```

If you don't have the Hyvä Checkout module installed, you need to disable the module instead:

```bash
bin/magento module:disable Mollie_HyvaCheckout
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
