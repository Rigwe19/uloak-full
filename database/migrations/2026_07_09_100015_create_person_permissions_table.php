<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->string('grantee_type'); // GranteeType
            $table->unsignedBigInteger('grantee_id')->nullable();
            $table->string('ability'); // PermissionAbility
            $table->boolean('allowed')->default(true);
            $table->string('inherited_from')->nullable();
            $table->timestamps();

            $table->index(['person_id', 'ability']);
            $table->index(['grantee_type', 'grantee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_permissions');
    }
};
