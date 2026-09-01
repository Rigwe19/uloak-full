<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tier')->index();
            $table->string('status')->default('active');
            $table->timestamp('current_period_start');
            $table->timestamp('current_period_end')->index();
            $table->boolean('cancel_at_period_end')->default(false);
            $table->string('provider', 20)->nullable();
            $table->string('provider_reference')->nullable()->index();
            $table->string('provider_customer_reference')->nullable();
            $table->string('region')->nullable();
            $table->char('currency', 3)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
