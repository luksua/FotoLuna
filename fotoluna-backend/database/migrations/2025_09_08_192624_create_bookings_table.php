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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id('bookingId');

            $table->foreignId('employeeIdFK')
                ->nullable()
                ->constrained('employees', 'employeeId')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreignId('packageIdFK')
                ->constrained('packages', 'packageId')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreignId('appointmentIdFK')
                ->constrained('appointments', 'appointmentId')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->enum('bookingStatus', ['Pending', 'Confirmed', 'Cancelled', 'Completed'])
                ->default('Pending');

            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
