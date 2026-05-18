<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'content', 'is_published', 'meta_description'])]
class Page extends Model
{
    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean',
    ];
}
