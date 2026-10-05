<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\RoomKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
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
        // kind is immutable after creation: an event room can never morph into a
        // free structural room (or vice versa). person_id is set once at creation.
        $currentKind = $this->route('room')?->kind;
        $currentKindValue = $currentKind instanceof RoomKind ? $currentKind->value : ($currentKind ?? 'event');

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
            'room_type' => ['nullable', 'string', 'in:general,birthday,burial,wedding,anniversary,memorial,graduation'],
            'kind' => ['nullable', 'string', Rule::in([$currentKindValue])],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'enable_tributes' => ['nullable', 'boolean'],
            'enable_condolence_attendance' => ['nullable', 'boolean'],
            'enable_candle_lighting' => ['nullable', 'boolean'],
            'tribute_name' => ['nullable', 'string', 'max:255'],
            'tribute_song' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:10240'],
            'existing_media_urls' => ['nullable', 'string'],
            'media_files' => ['nullable', 'array'],
            'media_files.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:10240'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ];
    }
}
