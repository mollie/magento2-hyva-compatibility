<?php
/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

declare(strict_types=1);

namespace Mollie\HyvaCompatibility\ViewModel;

use Magento\Framework\View\Element\Block\ArgumentInterface;
use Mollie\Payment\Service\Mollie\Express\ExpressComponentsBeta;
use Mollie\Payment\Service\Mollie\ExpressComponentsAvailability;

/**
 * Mollie_Payment applies the placement settings with layout handles for Luma. The Hyvä templates ask this view model
 * instead, so they follow the same rules.
 */
class ExpressComponents implements ArgumentInterface
{
    public function __construct(
        private readonly ExpressComponentsAvailability $availability,
        private readonly ExpressComponentsBeta $beta,
    ) {
    }

    public function isBetaEnabled(): bool
    {
        return $this->beta->isEnabled();
    }

    /**
     * Without the beta the minicart setting is hidden in the admin, and the minicart keeps showing the component.
     */
    public function shouldShowInMinicart(): bool
    {
        if (!$this->availability->isAvailable()) {
            return false;
        }

        return !$this->beta->isEnabled() || $this->beta->shouldShowInMinicart();
    }

    public function shouldShowOnProductPage(): bool
    {
        return $this->availability->isAvailable() && $this->beta->shouldShowOnProductPage();
    }
}
