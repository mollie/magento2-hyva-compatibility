#
# Copyright Magmodules.eu. All rights reserved.
# See COPYING.txt for license details.
#

if [ -z "$MOLLIE_API_KEY_TEST" ]; then
    echo "Variable \$MOLLIE_API_KEY_TEST is not set"
    exit 1
fi

# General configuration
bin/magento config:set payment/mollie_general/profileid pfl_8yCABHRz37
magerun2 config:store:set payment/mollie_general/apikey_test $MOLLIE_API_KEY_TEST --encrypt
bin/magento config:set payment/mollie_general/enabled 1
bin/magento config:set payment/mollie_general/type test
bin/magento config:set payment/mollie_general/process_transactions_in_the_queue 0

# Enable Apple Pay direct integration (required for product page, minicart and cart tests)
bin/magento config:set payment/mollie_methods_applepay/active 1
bin/magento config:set payment/mollie_methods_applepay/integration_type direct
bin/magento config:set payment/mollie_methods_applepay/enable_buy_now_button 1
bin/magento config:set payment/mollie_methods_applepay/enable_minicart_button 1

# Enable Credit Card with Customers API (required for saved cards feature)
bin/magento config:set payment/mollie_methods_creditcard/active 1
bin/magento config:set payment/mollie_methods_creditcard/use_components 1
bin/magento config:set payment/mollie_methods_creditcard/enable_customers_api 1

# Disable flat catalog
bin/magento config:set catalog/frontend/flat_catalog_category 0
bin/magento config:set catalog/frontend/flat_catalog_product 0

# Disable two factor authentication when it's enabled
if grep -q Magento_TwoFactorAuth "app/etc/config.php"; then
    ./retry "php bin/magento module:disable Magento_TwoFactorAuth -f"
fi

# Flush config
bin/magento cache:flush config
