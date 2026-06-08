<?php
/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Mollie\HyvaCompatibility\Block\Product\View;

use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Pricing\PriceCurrencyInterface;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Template;
use Mollie\Payment\Config;
use Mollie\Payment\Service\Mollie\ApplePay\SupportedNetworks;

class ApplePay extends \Mollie\Payment\Block\Product\View\ApplePay
{
    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var PriceCurrencyInterface
     */
    private $priceCurrency;

    public function __construct(
        Template\Context $context,
        Registry $registry,
        Config $config,
        SupportedNetworks $supportedNetworks,
        PriceCurrencyInterface $priceCurrency,
        array $data = []
    ) {
        parent::__construct($context, $registry, $config, $supportedNetworks, $data);

        $this->registry = $registry;
        $this->priceCurrency = $priceCurrency;
    }

    public function getProduct(): ProductInterface
    {
        $product = $this->registry->registry('product');

        if (!$product instanceof ProductInterface || !$product->getId()) {
            throw new LocalizedException(__('Failed to initialize product'));
        }
        return $product;
    }

    public function getProductPrice(): string
    {
        return round($this->getProduct()->getFinalPrice(), 2);
    }
}
