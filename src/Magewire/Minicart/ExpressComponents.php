<?php
/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

declare(strict_types=1);

namespace Mollie\HyvaCompatibility\Magewire\Minicart;

use Magento\Checkout\Model\Session;
use Magento\Quote\Api\CartRepositoryInterface;
use Magewirephp\Magewire\Component;
use Mollie\Payment\Service\Mollie\CreateSession;

class ExpressComponents extends Component
{
    public string $clientAccessToken = '';

    public function __construct(
        private readonly Session $checkoutSession,
        private readonly CartRepositoryInterface $cartRepository,
        private readonly CreateSession $createSession,
    ) {}

    public function createSession(): void
    {
        $cart = $this->checkoutSession->getQuote();
        $this->clientAccessToken = $this->createSession->execute($cart);

        $this->cartRepository->save($cart);
    }
}
