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
        Schema::table('packages', function (Blueprint $table) {
            // Relación con eventos (puede ser NULL si es un paquete general)
            $table->unsignedBigInteger('eventIdFK')->nullable()->after('price');
            $table->boolean('isGeneral')->default(false)->after('eventIdFK');

            $table->foreign('eventIdFK')
                ->references('eventId')
                ->on('events')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['eventIdFK']);
            $table->dropColumn(['eventIdFK', 'isGeneral']);
        });
    }
};
