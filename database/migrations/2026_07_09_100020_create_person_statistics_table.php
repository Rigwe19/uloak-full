<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('metric'); // StatMetric
            $table->decimal('value', 15, 2)->default(0);
            $table->string('period')->nullable(); // StatPeriod
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();

            $table->index(['person_id', 'metric', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_statistics');
    }
};
