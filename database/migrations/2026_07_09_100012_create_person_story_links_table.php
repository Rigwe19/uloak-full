<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_story_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->foreignId('story_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('mentioned'); // StoryLinkRole
            $table->string('context')->nullable();
            $table->timestamps();

            $table->unique(['person_id', 'story_id', 'role'], 'person_story_unique');
            $table->index('story_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_story_links');
    }
};
