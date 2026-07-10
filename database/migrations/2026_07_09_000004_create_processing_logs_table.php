<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processing_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('media_id')->nullable()->index();
            $table->string('media_uuid')->nullable()->index();
            $table->string('from_state')->nullable();
            $table->string('to_state');
            $table->integer('duration_ms')->nullable();
            $table->text('exception')->nullable();
            $table->integer('retry_count')->default(0);
            $table->string('cloudinary_public_id')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['media_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processing_logs');
    }
};
