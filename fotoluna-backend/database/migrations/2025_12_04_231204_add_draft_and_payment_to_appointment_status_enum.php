<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ⚠️ Reemplaza los valores por los EXACTOS que ya existen en tu tabla
        DB::statement("
            ALTER TABLE appointments 
            MODIFY appointmentStatus 
            ENUM('draft', 'Scheduled','Cancelled','Pending confirmation','Completed','Rescheduled')
            NOT NULL DEFAULT 'draft'
        ");
    }

    public function down(): void
    {
        // Revertir (sin draft)
        DB::statement("
            ALTER TABLE appointments 
            MODIFY appointmentStatus 
            ENUM('Scheduled','Cancelled','Pending confirmation','Completed','Rescheduled')
            NOT NULL DEFAULT 'Pending confirmation'
        ");
    }
};
