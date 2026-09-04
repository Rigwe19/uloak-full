<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Region
    |--------------------------------------------------------------------------
    |
    | Used when visitor geo-detection is unavailable. The launch market is
    | Nigeria, so it is the safe fallback.
    |
    */

    'default_region' => 'nigeria',

    /*
    |--------------------------------------------------------------------------
    | Regional Price Matrix
    |--------------------------------------------------------------------------
    |
    | All amounts are stored in minor units (kobo/cents/pence).
    | Customer-facing pricing cards must show only the single currency for
    | the visitor's selected region. Savings = 12 × monthly − yearly.
    |
    */

    'regions' => [
        'nigeria' => [
            'label' => 'Nigeria',
            'currency' => 'NGN',
            'geo_countries' => ['NG'],
            'full_room' => 15_000_000, // ₦150,000 — premium: full download + selected picture edits (manual) + 3-min highlight (manual)
            'family_monthly' => 350_000,
            'family_yearly' => 3_500_000,
            'yearly_savings' => 700_000,
        ],
        'rest_of_africa' => [
            'label' => 'Rest of Africa',
            'currency' => 'USD',
            'geo_countries' => ['ZA', 'KE', 'GH', 'EG', 'TZ', 'UG', 'ZW', 'ZM', 'CM', 'CI', 'SN', 'RW', 'ET'],
            'full_room' => 19_000, // $190.00 — 10x
            'family_monthly' => 499,
            'family_yearly' => 4_900,
            'yearly_savings' => 1_088,
        ],
        'uk' => [
            'label' => 'United Kingdom',
            'currency' => 'GBP',
            'geo_countries' => ['GB'],
            'full_room' => 29_000, // £290.00 — 10x
            'family_monthly' => 799,
            'family_yearly' => 7_900,
            'yearly_savings' => 1_688,
        ],
        'us_rest_of_world' => [
            'label' => 'United States / Rest of world',
            'currency' => 'USD',
            'geo_countries' => ['US', 'CA', 'AU', 'NZ', 'SG', 'MY', 'IN', 'BR', 'MX', 'JP', 'KR', 'PH', 'TH', 'AR', 'CL', 'CO'],
            'full_room' => 35_000, // $350.00 — 10x
            'family_monthly' => 999,
            'family_yearly' => 9_900,
            'yearly_savings' => 2_088,
        ],
        'europe' => [
            'label' => 'Europe',
            'currency' => 'EUR',
            'geo_countries' => ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'PT', 'IE', 'AT', 'PL', 'SE', 'DK', 'FI', 'NO', 'CH', 'GR', 'CZ'],
            'full_room' => 35_000, // €350.00 — 10x
            'family_monthly' => 999,
            'family_yearly' => 9_900,
            'yearly_savings' => 2_088,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tier Limits
    |--------------------------------------------------------------------------
    |
    | Storage values are in bytes. Starter Rooms close new contributions
    | after collection_days; Full Rooms grant access_months of online access.
    |
    */

    'tiers' => [
        'starter' => [
            'max_contributions' => 50,
            'storage_bytes' => 1_073_741_824, // 1GB
            'collection_days' => 30,
        ],
        'full_room' => [
            'storage_bytes' => 10_737_418_240, // 10GB
            'access_months' => 12,
        ],
        'family_archive' => [
            'storage_bytes' => 26_843_545_600, // 25GB
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Partner Referral Engine
    |--------------------------------------------------------------------------
    |
    | commission_rate is a percentage of the selling price. For NGN payments
    | the ₦3,000 launch commission equals exactly 20%; ngn_min_commission
    | enforces that floor in minor units.
    |
    */

    'partner' => [
        'commission_rate' => 20.0,
        'ngn_min_commission' => 3_000_000, // 20% of ₦150k floor
        'attribution_cookie_days' => 30,
    ],
];
