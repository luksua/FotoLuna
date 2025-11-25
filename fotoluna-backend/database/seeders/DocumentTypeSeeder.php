<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('document_types')->insert([
            [
                'name' => 'Licencia de Conducir',
                'slug' => 'licencia-conducir',
                'description' => 'Foto profesional con fondo azul, formato 3x4 cm.',
                'price' => 15000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/licencia.jpg',
                'requiresUpload' => false,
                'requiresPresence' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],[
                'name' => 'Visa & Pasaporte',
                'slug' => 'visa-pasaporte',
                'description' => 'Foto profesional con fondo azul, formato 3x4 cm.',
                'price' => 15000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/licencia.jpg',
                'requiresUpload' => false,
                'requiresPresence' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],[
                'name' => 'Documentos Escolares',
                'slug' => 'documentos-escolares',
                'description' => 'Fotografía digital en fondo blanco para CV o LinkedIn.',
                'price' => 12000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/hoja-vida.jpg',
                'requiresUpload' => true,
                'requiresPresence' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],[
                'name' => 'Tarjeta Profesional',
                'slug' => 'tarjeta-profesional',
                'description' => 'Fotografía digital en fondo blanco para CV o LinkedIn.',
                'price' => 12000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/hoja-vida.jpg',
                'requiresUpload' => true,
                'requiresPresence' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],[
                'name' => 'Hoja de Vida',
                'slug' => 'hoja-de-vida',
                'description' => 'Fotografía digital en fondo blanco para CV o LinkedIn.',
                'price' => 12000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/hoja-vida.jpg',
                'requiresUpload' => true,
                'requiresPresence' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],[
                'name' => 'Fuerzas Armadas',
                'slug' => 'fuerzas-armadas',
                'description' => 'Fotografía digital en fondo blanco para CV o LinkedIn.',
                'price' => 12000,
                'number_photos' => '1',
                'photoUrl' => '/images/docs/hoja-vida.jpg',
                'requiresUpload' => true,
                'requiresPresence' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}