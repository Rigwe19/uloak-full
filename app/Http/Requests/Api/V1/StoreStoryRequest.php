<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:photo,video,audio,document'],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm,mp3,wav,ogg,pdf', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:32'],
            'assets' => ['nullable', 'array'],
            'follow_up_to' => ['nullable', 'integer', 'exists:stories,id'],
        ];
    }
}
