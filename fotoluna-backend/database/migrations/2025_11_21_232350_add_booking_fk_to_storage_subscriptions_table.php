<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('storage_subscriptions', function (Blueprint $table) {
            // si ya existe, comenta esto para que no falle
            if (!Schema::hasColumn('storage_subscriptions', 'bookingIdFK')) {
                $table->unsignedBigInteger('bookingIdFK')->nullable()->after('plan_id');

                // si quieres FK real:
                $table->foreign('bookingIdFK')
                    ->references('bookingId')   // OJO: tu PK de bookings
                    ->on('bookings')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('storage_subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('storage_subscriptions', 'bookingIdFK')) {
                $table->dropForeign(['bookingIdFK']);
                $table->dropColumn('bookingIdFK');
            }
        });
    }
};
