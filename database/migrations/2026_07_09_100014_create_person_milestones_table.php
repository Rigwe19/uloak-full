<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->string('category'); // MilestoneCategory
            $table->json('media')->nullable();
            $table->timestamps();

            $table->index(['person_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_milestones');
    }
};
