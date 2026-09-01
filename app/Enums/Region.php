<?php

namespace App\Enums;

enum Region: string
{
    case Nigeria = 'nigeria';
    case RestOfAfrica = 'rest_of_africa';
    case Uk = 'uk';
    case UsRestOfWorld = 'us_rest_of_world';
    case Europe = 'europe';

    public function label(): string
    {
        return match ($this) {
            self::Nigeria => 'Nigeria',
            self::RestOfAfrica => 'Rest of Africa',
            self::Uk => 'United Kingdom',
            self::UsRestOfWorld => 'United States / Rest of world',
            self::Europe => 'Europe',
        };
    }

    public function currency(): string
    {
        return config('pricing.regions.'.$this->value.'.currency');
    }

    public function price(string $key): int
    {
        return (int) config('pricing.regions.'.$this->value.'.'.$key);
    }

    /**
     * @return array<int, string>
     */
    public function geoCountries(): array
    {
        return config('pricing.regions.'.$this->value.'.geo_countries', []);
    }

    public static function default(): self
    {
        return self::from(config('pricing.default_region'));
    }
}
