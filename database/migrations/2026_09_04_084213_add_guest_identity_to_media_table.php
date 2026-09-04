<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->foreignId('guest_identity_id')->nullable()->after('id')->constrained('guest_identities')->nullOnDelete();
            $table->index('guest_identity_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['guest_identity_id']);
            $table->dropIndex(['guest_identity_id']);
            $table->dropColumn('guest_identity_id');
        });
    }
};
