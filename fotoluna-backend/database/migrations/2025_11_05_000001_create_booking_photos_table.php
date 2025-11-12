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
        Schema::create('booking_photos', function (Blueprint $table) {
            $table->id('photoId');

            // Relación con la reserva (booking)
            $table->foreignId('bookingIdFK')
                ->constrained('bookings', 'bookingId')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            // Ruta del archivo (puede ser almacenamiento local o S3)
            $table->string('photoPath');

            // Descripción opcional
            $table->text('photoDescription')->nullable();

            // Opcional: quién subió la foto (si quieres rastrear al empleado)
            $table->foreignId('employeeIdFK')
                ->nullable()
                ->constrained('employees', 'employeeId')
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_photos');
    }
};
