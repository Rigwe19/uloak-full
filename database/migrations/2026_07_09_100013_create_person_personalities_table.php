<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_personalities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('section'); // LifeStorySection
            $table->longText('content')->nullable();
            $table->json('media')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['person_id', 'section']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_personalities');
    }
};
