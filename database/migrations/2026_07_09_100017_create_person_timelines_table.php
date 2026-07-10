<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('event_type'); // TimelineEventType
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->string('location')->nullable();
            $table->json('media')->nullable();
            $table->json('people')->nullable();
            $table->json('stories')->nullable();
            $table->json('documents')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['person_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_timelines');
    }
};
