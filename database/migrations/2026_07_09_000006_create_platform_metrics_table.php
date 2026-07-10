<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique()->index();
            $table->integer('new_users')->default(0);
            $table->integer('total_users')->default(0);
            $table->integer('uploads')->default(0);
            $table->integer('views')->default(0);
            $table->integer('unique_viewers')->default(0);
            $table->integer('watch_time_seconds')->default(0);
            $table->integer('active_rooms')->default(0);
            $table->integer('new_rooms')->default(0);
            $table->integer('processing_jobs')->default(0);
            $table->integer('failed_jobs')->default(0);
            $table->bigInteger('storage_bytes')->default(0);
            $table->bigInteger('bandwidth_bytes')->default(0);
            $table->integer('comments')->default(0);
            $table->integer('likes')->default(0);
            $table->float('avg_processing_time_ms')->default(0);
            $table->json('extra')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_metrics');
    }
};
