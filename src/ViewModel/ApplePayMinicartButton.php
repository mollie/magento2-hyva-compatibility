<?php
/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

declare(strict_types=1);

namespace Mollie\HyvaCompatibility\ViewModel;

use Magento\Framework\View\Element\Block\ArgumentInterface;
use Mollie\Payment\Config;

class ApplePayMinicartButton implements ArgumentInterface
{
    private const METHOD_CODE = 'mollie_methods_applepay';

    public function __construct(
        private readonly Config $config,
    ) {
    }

    public function isEnabled(): bool
    {
        return $this->config->isMethodActive(self::METHOD_CODE) && $this->config->applePayEnableMinicartButton();
    }
}
