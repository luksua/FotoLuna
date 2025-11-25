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
        Schema::create('cloud_photos', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('customerIdFK');
            $table->unsignedBigInteger('bookingIdFK')->nullable();
            $table->unsignedBigInteger('storage_subscription_id')->nullable(); // opcional

            $table->string('path');             // ruta en S3 / disco
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name')->nullable();
            $table->unsignedInteger('size')->nullable(); // bytes

            $table->timestamps();

            $table->foreign('customerIdFK')->references('customerId')->on('customers');
            $table->foreign('bookingIdFK')->references('bookingId')->on('bookings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cloud_photos');
    }
};
