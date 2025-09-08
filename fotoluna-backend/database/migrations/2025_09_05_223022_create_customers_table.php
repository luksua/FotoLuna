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
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customerId');
            $table->string('firstNameCustomer');
            $table->string('lastNameCustomer');
            $table->string('photoCustomer');
            $table->string('emailCustomer')->unique();
            $table->string('password');
            $table->string('phoneCustomer');
            $table->enum('documentType', ['CC', 'CE', 'PAS']);
            $table->string('documentNumber')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
