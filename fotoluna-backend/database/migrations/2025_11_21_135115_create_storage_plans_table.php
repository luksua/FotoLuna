<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('storage_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();

            // límite por cantidad de fotos
            $table->unsignedInteger('max_photos')->nullable(); // null = sin límite

            // límite por espacio (en MB, por ejemplo)
            $table->unsignedInteger('max_storage_mb')->nullable(); // null = sin límite

            // duración del plan
            $table->unsignedInteger('duration_months')->default(12);

            // precio del plan (en COP)
            $table->decimal('price', 10, 2);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_plans');
    }
};
