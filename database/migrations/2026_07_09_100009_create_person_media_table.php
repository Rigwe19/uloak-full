<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('archive'); // MediaRole
            $table->string('category')->nullable(); // photo|video|audio|document
            $table->string('context')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['person_id', 'media_id', 'role'], 'person_media_unique');
            $table->index('media_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_media');
    }
};
