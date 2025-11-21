<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('paymentStatus', 50)->change();
        });
    }

    public function down(): void
    {
        // aquí restauras lo que tenías antes, por ejemplo:
        // $table->enum('paymentStatus', ['Pending', 'Completed', 'Cancelled'])->change();
    }
};