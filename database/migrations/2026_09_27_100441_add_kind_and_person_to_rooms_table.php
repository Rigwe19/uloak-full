<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('kind', 16)->default('event')->after('room_type')->index();
            $table->foreignId('person_id')->nullable()->after('kind')->constrained('people')->nullOnDelete();
            $table->unique('person_id');
        });

        // All pre-existing rooms are occasion-based event rooms.
        DB::table('rooms')->whereNull('kind')->orWhere('kind', '')->update(['kind' => 'event']);
        DB::table('rooms')->whereNull('person_id')->update(['person_id' => null]);
    }

    public function down(): void
    {
        // Dropping the column implicitly drops its unique index on both
        // MySQL and SQLite, so only the FK needs explicit teardown first.
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropConstrainedForeignId('person_id');
            $table->dropIndex(['kind']);
            $table->dropColumn('kind');
        });
    }
};
