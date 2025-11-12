<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('documentTypeIdFK')->nullable()->after('packageIdFK');
            $table->foreign('documentTypeIdFK')->references('id')->on('document_types')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['documentTypeIdFK']);
            $table->dropColumn('documentTypeIdFK');
        });
    }
};
