<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('media_id')->nullable()->index();
            $table->string('title');
            $table->string('document_type'); // DocumentType
            $table->text('description')->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expires_date')->nullable();
            $table->string('visibility')->default('private'); // Visibility
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_documents');
    }
};
