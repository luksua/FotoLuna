<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // número de cuotas elegidas
            $table->unsignedTinyInteger('installments')
                ->nullable()
                ->after('paymentMethod');

            // opcional: id del pago en MP
            $table->string('mp_payment_id', 50)
                ->nullable()
                ->after('installments');

            // opcional: últimos 4 dígitos de la tarjeta
            $table->string('card_last_four', 4)
                ->nullable()
                ->after('mp_payment_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['installments', 'mp_payment_id', 'card_last_four']);
        });
    }
};
