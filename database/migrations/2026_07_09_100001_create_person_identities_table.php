<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('legal_name');
            $table->string('display_name')->nullable();
            $table->string('nickname')->nullable();
            $table->string('traditional_name')->nullable();
            $table->json('former_names')->nullable();
            $table->string('title')->nullable();
            $table->unsignedBigInteger('pronunciation_audio_media_id')->nullable()->index();
            $table->string('gender')->nullable();
            $table->date('birth_date')->nullable();
            $table->date('death_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->string('death_place')->nullable();
            $table->string('burial_location')->nullable();
            $table->text('biography')->nullable();
            $table->text('short_introduction')->nullable();
            $table->string('age_visibility')->default('public'); // Visibility
            $table->json('field_visibility')->nullable();
            $table->timestamps();

            $table->unique('person_id');
            $table->index('birth_date');
            $table->index('death_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_identities');
    }
};
