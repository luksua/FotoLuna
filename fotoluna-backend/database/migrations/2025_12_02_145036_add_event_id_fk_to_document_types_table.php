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
        Schema::table('document_types', function (Blueprint $table) {

            // 1. Añadir la columna eventIdFK (UNSIGNED BIG INTEGER)
            // La hacemos nullable temporalmente si hay datos existentes que deban ser actualizados.
            // Si la columna 'price' existe, la colocamos después de ella. Ajusta el 'after()' si es necesario.
            $table->unsignedBigInteger('eventIdFK')->after('price')->nullable();

            // 2. Definir la restricción de clave foránea
            // Apunta a la clave primaria 'eventId' de la tabla 'events'.
            $table->foreign('eventIdFK')
                ->references('eventId')
                ->on('events')
                ->onDelete('cascade'); // Asegura la integridad referencial.
        });
    }

    /**
     * Revierte la migración (elimina la columna y la restricción).
     */
    public function down(): void
    {
        Schema::table('document_types', function (Blueprint $table) {
            // 1. Eliminar la restricción (siempre primero)
            $table->dropForeign(['eventIdFK']);

            // 2. Eliminar la columna
            $table->dropColumn('eventIdFK');
        });
    }
};
