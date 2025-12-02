<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Añade la columna para la duración de la cita (en minutos)
            // Se coloca nullable por si existen citas antiguas sin duración, aunque el default debería evitarlo.
            $table->unsignedInteger('appointmentDuration')
                ->default(60)
                ->after('comment'); 
            
            // Si la columna packageIdFK NO DEBE estar aquí, omite agregarla. 
            // Si ya la tienes en bookings, NO la agregues en appointments.

        });
    }

    /**
     * Reverse the migrations (revierte los cambios).
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Elimina la columna cuando se hace rollback
            $table->dropColumn('appointmentDuration');
        });
    }
};