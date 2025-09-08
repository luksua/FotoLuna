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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('paymentId');

            $table->foreignId('bookingIdFK')
                ->constrained('bookings', 'bookingId')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->decimal('amount', 10, 2);
            $table->dateTime('paymentDate');

            $table->enum('paymentMethod', [
                'Cash',
                'Card',
                'Transfer',
                'PSE',
                'Nequi',
                'Daviplata'
            ]);

            $table->enum('paymentStatus', ['Pending', 'Confirmed'])->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
