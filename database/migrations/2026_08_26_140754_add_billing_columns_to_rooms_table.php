<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('tier_type')->nullable()->after('room_type');
            $table->unsignedBigInteger('storage_used_bytes')->default(0)->after('tier_type');
            $table->unsignedBigInteger('storage_limit_bytes')->nullable()->after('storage_used_bytes');
            $table->timestamp('expires_at')->nullable()->after('end_date');
            $table->timestamp('contributions_closed_at')->nullable()->after('expires_at');
            $table->string('status')->default('active')->after('contributions_closed_at');
            $table->text('welcome_message')->nullable()->after('tribute_song');
            $table->json('wedding_dates')->nullable()->after('start_date');
            $table->foreignId('referral_partner_id')->nullable()->constrained('partners')->nullOnDelete();

            $table->index(['status', 'tier_type']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referral_partner_id');
            $table->dropIndex(['status', 'tier_type']);
            $table->dropIndex(['expires_at']);
            $table->dropColumn([
                'tier_type',
                'storage_used_bytes',
                'storage_limit_bytes',
                'expires_at',
                'contributions_closed_at',
                'status',
                'welcome_message',
                'wedding_dates',
            ]);
        });
    }
};
