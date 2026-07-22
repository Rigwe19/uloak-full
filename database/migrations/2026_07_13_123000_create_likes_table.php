<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_identifier')->nullable(); // For magic link users (email hash or identifier)
            $table->foreignId('story_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Ensure unique like per user or guest identifier
            $table->unique(['user_id', 'story_id'], 'likes_user_story_unique');
            $table->unique(['guest_identifier', 'story_id'], 'likes_guest_story_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
