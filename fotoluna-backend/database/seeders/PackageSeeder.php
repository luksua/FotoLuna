<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('packages')->insert([
            [
                'packageName' => 'Básico',
                'packageDescription' => 'Sesión de 1 hora con 10 fotos editadas en alta resolución.',
                'price' => 50.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Premium',
                'packageDescription' => 'Sesión de 2 horas con 25 fotos editadas, incluye asesoría de vestuario.',
                'price' => 100.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Deluxe',
                'packageDescription' => 'Sesión de 3 horas, 40 fotos editadas y video resumen del evento.',
                'price' => 150.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'packageName' => 'Golden Memories',
                'packageDescription' => 'Cobertura completa del evento, álbum impreso y video profesional.',
                'price' => 250.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
