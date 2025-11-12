<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // 📸 Campo para identificar el rol
            $table->enum('role', ['Photographer', 'Assistant', 'Admin', 'Other'])
                ->default('Other')
                ->after('employeeType');

            // 🧠 Campo para la especialidad
            $table->string('specialty')->nullable()->after('role');

            // ✅ Campo para disponibilidad
            $table->boolean('isAvailable')->default(true)->after('specialty');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['role', 'specialty', 'isAvailable']);
        });
    }
};
