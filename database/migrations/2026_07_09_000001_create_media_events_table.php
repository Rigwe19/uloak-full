<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name');
            $table->nullableMorphs('eventable');
            $table->unsignedBigInteger('story_id')->nullable()->index();
            $table->unsignedBigInteger('room_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('media_type')->nullable();
            $table->string('device')->nullable();
            $table->string('browser')->nullable();
            $table->string('country')->nullable();
            $table->string('session_id')->nullable()->index();
            $table->string('anonymous_id')->nullable()->index();
            $table->ipAddress('ip_address')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['event_name', 'created_at']);
            $table->index(['eventable_type', 'eventable_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_events');
    }
};
