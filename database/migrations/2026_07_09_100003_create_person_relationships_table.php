<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained('people')->cascadeOnDelete();
            $table->foreignId('related_person_id')->constrained('people')->cascadeOnDelete();
            $table->string('relationship_type'); // RelationshipType
            $table->string('kind')->default('biological'); // RelationshipKind
            $table->string('status')->default('active'); // RelationshipStatus
            $table->unsignedTinyInteger('confidence')->default(100);
            $table->foreignId('source_id')->nullable()->constrained('person_relationship_sources')->nullOnDelete();
            $table->text('evidence')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            // Emotional relationship fields
            $table->string('called_them')->nullable();
            $table->string('called_me')->nullable();
            $table->unsignedTinyInteger('closeness')->nullable();
            $table->text('favourite_memory')->nullable();
            $table->text('relationship_notes')->nullable();
            $table->text('things_taught')->nullable();
            $table->text('stories_together')->nullable();
            $table->text('private_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['person_id', 'related_person_id', 'relationship_type'], 'person_rel_unique');
            $table->index('related_person_id');
            $table->index(['person_id', 'relationship_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_relationships');
    }
};
