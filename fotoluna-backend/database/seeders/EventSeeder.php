<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'eventType' => 'Maternidad',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Cumpleaños',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Quince años',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Bodas',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Sacramentos',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Documento',
                'category' => 'document_photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Grados',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'eventType' => 'Otros',
                'category' => 'photo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}