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
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej: "Licencia de Conducir"
            $table->string('slug')->unique()->nullable(); // para URLs limpias
            $table->text('description')->nullable(); // Ej: "Foto fondo azul 3x4 para licencia"
            $table->integer('number_photos');
            $table->decimal('price', 10, 2)->default(0);
            $table->string('photoUrl')->nullable(); // miniatura o ejemplo
            $table->boolean('requiresUpload')->default(false);
            $table->boolean('requiresPresence')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};



