<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('consent_type'); // ConsentType
            $table->string('status'); // ConsentStatus
            $table->unsignedBigInteger('granted_by')->nullable()->index();
            $table->unsignedBigInteger('guardian_id')->nullable()->index();
            $table->unsignedInteger('version')->default(1);
            $table->text('evidence')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['person_id', 'consent_type', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_consents');
    }
};
