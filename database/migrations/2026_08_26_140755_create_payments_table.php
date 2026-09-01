<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3);
            $table->string('provider', 20);
            $table->string('provider_reference')->nullable()->index();
            $table->string('idempotency_key')->unique();
            $table->string('status')->default('pending')->index();
            $table->string('region')->nullable();
            $table->foreignId('partner_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('commission_amount')->nullable();
            $table->json('utm')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
