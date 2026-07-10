<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('family_member'); // PersonType
            $table->string('living_status')->default('living'); // LivingStatus
            $table->unsignedBigInteger('primary_photo_media_id')->nullable()->index();
            $table->unsignedInteger('birth_order')->nullable();
            $table->string('family_branch')->nullable();
            $table->string('clan')->nullable();
            $table->string('kindred')->nullable();
            $table->string('ancestral_home')->nullable();
            $table->unsignedInteger('diaspora_generation')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('clan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('people');
    }
};
