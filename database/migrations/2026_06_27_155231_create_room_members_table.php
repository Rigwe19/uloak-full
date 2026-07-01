<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('name');
            $table->string('relationship')->nullable();
            $table->string('access_token', 128)->unique();
            $table->timestamps();

            $table->unique(['room_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_members');
    }
};
