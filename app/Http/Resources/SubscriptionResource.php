<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tier' => $this->tier->value,
            'tier_label' => $this->tier->label(),
            'is_viewer' => $this->tier->isViewer(),
            'is_vip_viewer' => $this->tier->isVipViewer(),
            'status' => $this->status->value,
            'current_period_start' => $this->current_period_start?->toIso8601String(),
            'current_period_end' => $this->current_period_end?->toIso8601String(),
            'cancel_at_period_end' => $this->cancel_at_period_end,
            'provider' => $this->provider?->value,
            'region' => $this->region?->value,
            'currency' => $this->currency,
            'referred_creator_profile_id' => $this->referred_creator_profile_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
