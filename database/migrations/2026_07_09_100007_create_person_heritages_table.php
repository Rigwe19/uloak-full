<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_heritages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('nationality')->nullable();
            $table->string('ethnicity')->nullable();
            $table->string('tribe')->nullable();
            $table->string('clan')->nullable();
            $table->string('village')->nullable();
            $table->string('town')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('religion')->nullable();
            $table->text('migration_story')->nullable();
            $table->json('family_recipes')->nullable();
            $table->json('cultural_practices')->nullable();
            $table->timestamps();

            $table->unique('person_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_heritages');
    }
};
