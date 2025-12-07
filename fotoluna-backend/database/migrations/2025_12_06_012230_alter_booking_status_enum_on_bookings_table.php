<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 👇 Ajusta los valores según los que ya tengas en la BD
        DB::statement("
            ALTER TABLE `bookings`
            MODIFY `bookingStatus` ENUM('Pending', 'Pending payment', 'Confirmed', 'Cancelled', 'Completed')
            NOT NULL
            DEFAULT 'Pending'
        ");
    }

    public function down(): void
    {
        // ⚠️ Antes de hacer rollback asegúrate de que no queden registros con 'Pending payment'
        DB::statement("
            ALTER TABLE `bookings`
            MODIFY `bookingStatus` ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed')
            NOT NULL
            DEFAULT 'Pending'
        ");
    }
};
