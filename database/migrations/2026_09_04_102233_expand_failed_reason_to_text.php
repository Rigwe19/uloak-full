<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL for Postgres to avoid doctrine/dbal requirement on change()
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE media ALTER COLUMN failed_reason TYPE TEXT USING failed_reason::text');
        } else {
            Schema::table('media', function (Blueprint $table) {
                $table->text('failed_reason')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE media ALTER COLUMN failed_reason TYPE VARCHAR(255) USING LEFT(failed_reason::text, 255)');
        } else {
            Schema::table('media', function (Blueprint $table) {
                $table->string('failed_reason', 255)->nullable()->change();
            });
        }
    }
};
