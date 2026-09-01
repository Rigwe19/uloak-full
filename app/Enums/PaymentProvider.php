<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case Paystack = 'paystack';
    case PayPal = 'paypal';
    case Stripe = 'stripe';
}
