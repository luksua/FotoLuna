<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cloud_photos', function (Blueprint $table) {
            $table->unsignedBigInteger('uploaded_by_employee_id')->nullable()->after('storage_subscription_id');

            // Asumimos que la tabla 'employees' tiene un 'employeeId' como clave primaria
            // y que está relacionada con un usuario.
            $table->foreign('uploaded_by_employee_id')->references('employeeId')->on('employees')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cloud_photos', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by_employee_id']);
            $table->dropColumn('uploaded_by_employee_id');
        });
    }
};
