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
        if (!Schema::hasTable('comments')) {
            Schema::create('comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('photographer_id')->nullable()->constrained('users')->onDelete('set null');
                $table->integer('rating')->unsigned()->between(1, 5); // 1-5 estrellas
                $table->text('comment_text');
                $table->string('photo_path')->nullable(); // ruta de la foto si existe
                $table->boolean('is_anonymous')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
