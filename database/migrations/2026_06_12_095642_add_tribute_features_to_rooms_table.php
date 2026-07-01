<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('room_type')->nullable()->after('privacy');
            $table->boolean('enable_tributes')->default(false)->after('room_type');
            $table->boolean('enable_condolence_attendance')->default(false)->after('enable_tributes');
            $table->boolean('enable_candle_lighting')->default(false)->after('enable_condolence_attendance');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['room_type', 'enable_tributes', 'enable_condolence_attendance', 'enable_candle_lighting']);
        });
    }
};
