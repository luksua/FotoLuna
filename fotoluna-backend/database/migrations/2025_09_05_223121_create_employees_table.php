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
        Schema::create('employees', function (Blueprint $table) {
            $table->id('employeeId');
            $table->string('firstNameEmployee');
            $table->string('lastNameEmployee');
            $table->string('phoneEmployee');
            $table->string('photoEmployee');
            $table->string('address');
            $table->enum('documentType', ['CC', 'CE', 'PAS']);
            $table->string('documentNumber')->unique();
            $table->string('emailEmployee')->unique();
            $table->string('password');
            $table->enum('employeeType', ['Employee', 'Admin']);
            $table->enum('gender', ['Female', 'Male', 'Other']);
            $table->string('EPS');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
