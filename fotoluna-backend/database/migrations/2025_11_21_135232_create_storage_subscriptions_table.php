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
        Schema::create('storage_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customerIdFK'); // o userIdFK si usas users
            $table->unsignedBigInteger('plan_id');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');

            // enlace con pagos / MP
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->string('mp_payment_id')->nullable();

            $table->timestamps();

            $table->foreign('customerIdFK')->references('customerId')->on('customers');
            $table->foreign('plan_id')->references('id')->on('storage_plans');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_subscriptions');
    }
};
