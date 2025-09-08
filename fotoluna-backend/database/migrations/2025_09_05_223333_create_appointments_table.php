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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointmentId');
        
            $table->foreignId('customerIdFK')
                ->constrained('customers', 'customerId')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        
            $table->foreignId('eventIdFK')
                ->constrained('events', 'eventId')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        
            $table->date('appointmentDate');
            $table->time('appointmentTime');
            $table->string('place', 100);
            $table->text('comment')->nullable();
            $table->enum('appointmentStatus', ['Scheduled', 'Cancelled', 'Pending confirmation', 'Completed', 'Rescheduled']);
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
