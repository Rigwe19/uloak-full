<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
            'room_type' => ['nullable', 'string', 'in:general,birthday,burial,wedding,anniversary,memorial,graduation'],
            'tier_type' => ['nullable', 'string', 'in:starter,full_room,family_archive'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'enable_tributes' => ['nullable', 'boolean'],
            'enable_condolence_attendance' => ['nullable', 'boolean'],
            'enable_candle_lighting' => ['nullable', 'boolean'],
            'tribute_name' => ['nullable', 'string', 'max:255'],
            'tribute_song' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:10240'],
            'media_items' => ['nullable', 'array'],
            'media_items.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:10240'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
        ];
    }
}
