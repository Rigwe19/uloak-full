<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->string('context')->nullable();
            $table->timestamps();

            $table->index(['person_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_roles');
    }
};
