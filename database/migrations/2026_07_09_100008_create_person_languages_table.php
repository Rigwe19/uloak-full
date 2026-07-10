<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_languages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('language');
            $table->string('dialect')->nullable();
            $table->string('proficiency')->default('fluent'); // LanguageProficiency
            $table->timestamps();

            $table->unique(['person_id', 'language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_languages');
    }
};
