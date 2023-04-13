<?php
/*
 *  Copyright Magmodules.eu. All rights reserved.
 *  See COPYING.txt for license details.
 */

namespace Mollie\HyvaCheckout\Service;

use Hyva\Checkout\Model\Magewire\Payment\AbstractPlaceOrderService;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Model\Quote;
use Magento\Sales\Api\OrderRepositoryInterface;
use Mollie\Payment\Service\Mollie\Order\RedirectUrl;

class PlaceOrderService extends AbstractPlaceOrderService
{
    /**
     * @var OrderRepositoryInterface
     */
    private $orderRepository;

    /**
     * @var RedirectUrl
     */
    private $redirectUrl;

    public function __construct(
        CartManagementInterface $cartManagement,
        OrderRepositoryInterface $orderRepository,
        RedirectUrl $redirectUrl
    ) {
        parent::__construct($cartManagement);
        $this->orderRepository = $orderRepository;
        $this->redirectUrl = $redirectUrl;
    }

    public function canPlaceOrder(): bool
    {
        return true;
    }

    public function getRedirectUrl(Quote $quote, ?int $orderId = null): string
    {
        $order = $this->orderRepository->get($orderId);
        $method = $quote->getPayment()->getMethodInstance();

        return $this->redirectUrl->execute($method, $order);
    }
}
