<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // Contenido para database/migrations/YYYY_MM_DD_HHMMSS_create_employee_actions_table.php

    public function up(): void
    {
        Schema::create('employee_actions', function (Blueprint $table) {
            $table->id();

            // 1) Columna con MISMO tipo que employees.employeeId
            $table->unsignedBigInteger('employeeId');

            // 2) Foreign key explícita hacia employees.employeeId
            $table->foreign('employeeId', 'employee_id')
                ->references('employeeId')
                ->on('employees')
                ->onDelete('cascade');

            // 3) Relación opcional con users (asumiendo users.id estándar)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // 4) Datos de la acción
            $table->string('action_type');    // Ej: 'created', 'status_changed', 'report_generated'
            $table->json('details')->nullable(); // Datos extra, ej: estado anterior/nuevo

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_actions');
    }
};
