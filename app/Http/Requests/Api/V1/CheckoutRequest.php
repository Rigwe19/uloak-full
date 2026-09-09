<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['nullable', 'integer', 'exists:rooms,id'],
            'region' => ['required', 'string', 'in:nigeria,rest_of_africa,uk,us_rest_of_world,europe'],
            'tier' => ['required', 'string', 'in:starter,full_room,family_archive,family_monthly,family_yearly'],
            'provider' => ['nullable', 'string', 'in:paystack,paypal,stripe'],
            'ref_code' => ['nullable', 'string', 'max:32'],
        ];
    }
}
