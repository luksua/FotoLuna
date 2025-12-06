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
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Quién realizó la acción
            $table->string('action_type'); // Ej: 'created', 'status_changed', 'report_generated'
            $table->json('details')->nullable(); // Para guardar datos extra, ej: el estado anterior y el nuevo
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
