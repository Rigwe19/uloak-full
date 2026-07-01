<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePushSubscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key constraints for SQLite in-memory testing.
        Schema::connection(config('webpush.database_connection'))
            ->disableForeignKeyConstraints();

        // Ensure a fresh table.
        Schema::connection(config('webpush.database_connection'))
            ->dropIfExists(config('webpush.table_name'));

        Schema::connection(config('webpush.database_connection'))
            ->create(config('webpush.table_name'), function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->morphs('subscribable', 'push_subscriptions_subscribable_morph_idx');
                $table->string('endpoint', 500)->unique();
                $table->string('public_key')->nullable();
                $table->string('auth_token')->nullable();
                $table->string('content_encoding')->nullable();
                $table->timestamps();
            });

        // Re-enable foreign key constraints.
        Schema::connection(config('webpush.database_connection'))
            ->enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection(config('webpush.database_connection'))
            ->dropIfExists(config('webpush.table_name'));
    }
}
