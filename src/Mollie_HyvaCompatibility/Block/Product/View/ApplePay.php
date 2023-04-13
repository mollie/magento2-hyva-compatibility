<?php
/*
 *  Copyright Magmodules.eu. All rights reserved.
 *  See COPYING.txt for license details.
 */

namespace Mollie\HyvaCompatibility\Block\Product\View;

use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Template;
use Mollie\Payment\Config;

class ApplePay extends \Mollie\Payment\Block\Product\View\ApplePay
{
    /**
     * @var Registry
     */
    private $registry;

    public function __construct(
        Template\Context $context,
        Registry $registry,
        Config $config,
        array $data = []
    ) {
        parent::__construct($context, $registry, $config, $data);

        $this->registry = $registry;
    }

    public function getProduct(): ProductInterface
    {
        $product = $this->registry->registry('product');

        if (!$product instanceof ProductInterface || !$product->getId()) {
            throw new LocalizedException(__('Failed to initialize product'));
        }
        return $product;
    }

    public function getProductPrice(): float
    {
        return $this->getProduct()->getFinalPrice();
    }
}
