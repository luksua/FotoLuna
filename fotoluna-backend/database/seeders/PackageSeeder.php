<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');

        // Desactivar claves foráneas (IMPORTANTE)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Vaciar la tabla
        DB::table('packages')->truncate();

        // Reactivar claves foráneas
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        DB::table('packages')->insert([
            [
                'packageName' => 'Básico',
                'packageDescription' => 'Sesión de 1 hora con 10 fotos editadas en alta resolución.',
                'price' => 50000,
                'state' => 1,
                'eventIdFK' => null,
                'isGeneral' => 1,
                'durationMinutes' => 60,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Premium',
                'packageDescription' => 'Sesión de 2 horas con 25 fotos editadas, incluye asesoría de vestuario.',
                'price' => 100000,
                'state' => 1,
                'eventIdFK' => null,
                'isGeneral' => 1,
                'durationMinutes' => 120,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Deluxe',
                'packageDescription' => 'Sesión de 3 horas, 40 fotos editadas y video resumen del evento.',
                'price' => 150000,
                'state' => 1,
                'eventIdFK' => null,
                'isGeneral' => 1,
                'durationMinutes' => 180,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Maternidad Premium',
                'packageDescription' => 'Sesión de 2 horas, 40 fotos editadas, asesoría, reel y USB',
                'price' => 320000,
                'state' => 1,
                'eventIdFK' => 1,
                'isGeneral' => 0,
                'durationMinutes' => 120,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Cumpleaños Fiesta Completa',
                'packageDescription' => 'Cobertura de 2 horas, 50 fotos, mini sesión y video highlight',
                'price' => 280000,
                'state' => 1,
                'eventIdFK' => 2,
                'isGeneral' => 0,
                'durationMinutes' => 120,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Quince Glam',
                'packageDescription' => 'Sesión pre-15 y evento, 80 fotos, outfits, photobook y ampliación',
                'price' => 550000,
                'state' => 1,
                'eventIdFK' => 3,
                'isGeneral' => 0,
                'durationMinutes' => 270,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Mini Quince',
                'packageDescription' => 'Mini sesión económica con 5 fotos editadas',
                'price' => 15000,
                'state' => 1,
                'eventIdFK' => 3,
                'isGeneral' => 0,
                'durationMinutes' => 10,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Boda Clásica',
                'packageDescription' => 'Cobertura de 4 horas con 120 fotos editadas y sesión pareja',
                'price' => 750000,
                'state' => 1,
                'eventIdFK' => 4,
                'isGeneral' => 0,
                'durationMinutes' => 240,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Boda Full Day',
                'packageDescription' => 'Cobertura completa, 250 fotos, preboda, video y photobook premium',
                'price' => 1450000,
                'state' => 1,
                'eventIdFK' => 4,
                'isGeneral' => 0,
                'durationMinutes' => 480,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Sacramentos Ceremonial',
                'packageDescription' => 'Cobertura de 1.5 horas, 40 fotos editadas y mini sesión',
                'price' => 260000,
                'state' => 1,
                'eventIdFK' => 5,
                'isGeneral' => 0,
                'durationMinutes' => 90,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Grado Individual',
                'packageDescription' => 'Sesión de 45 minutos, 20 fotos y foto impresa',
                'price' => 150000,
                'state' => 1,
                'eventIdFK' => 7,
                'isGeneral' => 0,
                'durationMinutes' => 45,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'packageName' => 'Grado Familiar',
                'packageDescription' => 'Sesión de 1 hora con 35 fotos y mini reel',
                'price' => 220000,
                'state' => 1,
                'eventIdFK' => 7,
                'isGeneral' => 0,
                'durationMinutes' => 60,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
