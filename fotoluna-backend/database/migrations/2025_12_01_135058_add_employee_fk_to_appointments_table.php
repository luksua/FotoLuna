<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Se añade la clave foránea del empleado (nullable porque las citas antiguas no la tienen)
            $table->unsignedBigInteger('employeeIdFK')->nullable()->after('eventIdFK');
            
            // Definir la restricción de clave foránea
            $table->foreign('employeeIdFK')
                ->references('employeeId') // Asumo que esta es la clave primaria de tu tabla employees
                ->on('employees') 
                ->onDelete('set null'); // Si se elimina el empleado, la cita no se borra.
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['employeeIdFK']);
            $table->dropColumn('employeeIdFK');
        });
    }
};
