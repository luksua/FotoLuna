<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_payment_installments', function (Blueprint $table) {
            $table->id();
            // Relación con la reserva
            $table->unsignedBigInteger('bookingIdFK');
            $table->unsignedInteger('number'); // cuota #1, #2, etc.

            $table->date('due_date');
            $table->unsignedBigInteger('amount'); // en centavos o entero en COP

            // Estado de la cuota
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->timestamp('paid_at')->nullable();

            // Relación con el pago real (tabla payments) si quieres enlazar
            $table->unsignedBigInteger('paymentIdFK')->nullable();

            // PDF o URL del recibo de esa cuota
            $table->string('receipt_path')->nullable();

            $table->timestamps();

            $table->foreign('bookingIdFK')
                ->references('bookingId')->on('bookings')
                ->onDelete('cascade');

            $table->foreign('paymentIdFK')
                ->references('paymentId')->on('payments')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payment_installments');
    }
};
