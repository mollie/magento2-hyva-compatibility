#
# Copyright Magmodules.eu. All rights reserved.
# See COPYING.txt for license details.
#

set -e
set -x

if [ -z "$HYVA_SSH_PRIVATE_KEY" ]; then
    echo "Variable \$HYVA_SSH_PRIVATE_KEY is not set"
    exit 1
fi

eval `ssh-agent -s`
mkdir -p ~/.ssh/ && touch ~/.ssh/known_hosts
echo "$HYVA_SSH_PRIVATE_KEY" | ssh-add -
ssh-keyscan -t rsa gitlab.hyva.io >> ~/.ssh/known_hosts

composer config repositories.hyva-themes/magento2-theme-module git git@gitlab.hyva.io:hyva-themes/magento2-theme-module.git
composer config repositories.hyva-themes/magento2-reset-theme git git@gitlab.hyva.io:hyva-themes/magento2-reset-theme.git
composer config repositories.hyva-themes/magento2-email-module git git@gitlab.hyva.io:hyva-themes/magento2-email-module.git
composer config repositories.hyva-themes/magento2-default-theme git git@gitlab.hyva.io:hyva-themes/magento2-default-theme.git
composer config repositories.hyva-themes/magento2-default-theme-csp git git@gitlab.hyva.io:hyva-themes/magento2-default-theme-csp.git
composer config repositories.hyva-themes/magento2-compat-module-fallback git git@gitlab.hyva.io:hyva-themes/magento2-compat-module-fallback.git

composer require hyva-themes/magento2-default-theme-csp

bin/magento setup:upgrade --keep-generated

# Set Hyva Default CSP theme (theme_id=5) for the default store view
magerun2 config:store:set design/theme/theme_id 5 --scope=stores --scope-id=1

# Enable CSP
magerun2 config:store:set system/default/csp/policies/storefront/scripts/inline 0
magerun2 config:store:set system/default/csp/policies/storefront/scripts/eval 0
magerun2 config:store:set system/default/csp/mode/storefront/report_only 0

bin/magento hyva:config:generate

npm --prefix vendor/hyva-themes/magento2-default-theme-csp/web/tailwind/ ci
npm --prefix vendor/hyva-themes/magento2-default-theme-csp/web/tailwind/ run build-prod
