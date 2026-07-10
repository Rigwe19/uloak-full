<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('house_members', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->text('bio')->nullable()->after('avatar');
            $table->json('preferences')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('house_members', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'bio', 'preferences']);
        });
    }
};
