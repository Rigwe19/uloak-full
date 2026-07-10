<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cloudinary_usage', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique()->index();
            $table->bigInteger('storage_bytes')->default(0);
            $table->bigInteger('bandwidth_bytes')->default(0);
            $table->integer('transformations')->default(0);
            $table->integer('derived_assets')->default(0);
            $table->integer('preview_clips')->default(0);
            $table->integer('sprite_sheets')->default(0);
            $table->integer('watermarked_videos')->default(0);
            $table->bigInteger('credits_used')->default(0);
            $table->bigInteger('credits_remaining')->nullable();
            $table->json('raw_api_response')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cloudinary_usage');
    }
};
