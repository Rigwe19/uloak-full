<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('status')->nullable()->after('checksum');
            $table->string('provider', 32)->default('local')->after('status');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('cloudinary_public_id')->nullable()->after('provider_id');
            $table->text('thumbnail')->nullable()->after('cloudinary_public_id');
            $table->text('preview')->nullable()->after('thumbnail');
            $table->json('sprite')->nullable()->after('preview');
            $table->decimal('duration', 10, 3)->nullable()->after('sprite');
            $table->decimal('aspect_ratio', 8, 4)->nullable()->after('duration');
            $table->string('failed_reason')->nullable()->after('aspect_ratio');
            $table->unsignedTinyInteger('retry_count')->default(0)->after('failed_reason');
            $table->timestamp('processing_started_at')->nullable()->after('retry_count');
            $table->timestamp('processing_completed_at')->nullable()->after('processing_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'provider',
                'provider_id',
                'cloudinary_public_id',
                'thumbnail',
                'preview',
                'sprite',
                'duration',
                'aspect_ratio',
                'failed_reason',
                'retry_count',
                'processing_started_at',
                'processing_completed_at',
            ]);
        });
    }
};
