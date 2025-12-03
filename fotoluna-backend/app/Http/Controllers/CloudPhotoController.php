<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CloudPhoto;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking; // Importar el modelo Booking
use App\Models\Appointment; // Importar el modelo Appointment
use Illuminate\Support\Facades\Validator; // Asegurar que Validator está disponible
use Throwable;
use App\Models\StorageSubscription; // Necesitas importar el modelo de suscripción
use Carbon\Carbon;


class CloudPhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    // Subida de varias fotos al storage de Contabo
    public function store(Request $request)
    {
        // 1. ✅ VALIDACIÓN
        // Se valida que bookingIdFK sea REQUERIDO y EXISTA en la tabla bookings.
        $validatedData = $request->validate([
            'photos.*' => ['required', 'image', 'max:5120'],
            'event_name' => ['required', 'string'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string'],
            'linked_users' => ['nullable', 'string'],
            'employee_id' => ['required', 'integer', 'exists:users,id'],
            'customerIdFK' => ['required', 'integer', 'exists:customers,customerId'],

            // 🚨 CLAVE CORREGIDA: Recibimos la ID de la reserva seleccionada del frontend
            'bookingIdFK' => ['required', 'integer', 'exists:bookings,bookingId'],
            'storage_subscription_id' => ['nullable', 'integer'],
        ]);

        if (!$request->hasFile('photos')) {
            return response()->json(['message' => 'No se recibieron archivos.'], 422);
        }

        // 2. 🔑 OBTENER ID DIRECTAMENTE DEL PAYLOAD VALIDADO
        // Si la validación pasó, garantizamos que $bookingId tiene un valor existente.
        $bookingId = $validatedData['bookingIdFK'];

        $uploaded = [];

        // 3. Subir y Guardar en BD (Iterar sobre cada foto)
        foreach ($request->file('photos') as $photo) {

            try {
                $path = $photo->store('cloud_photos', 's3');
                Storage::disk('s3')->setVisibility($path, 'public');

                $cloudPhoto = CloudPhoto::create([
                    'customerIdFK' => $validatedData['customerIdFK'],
                    // 🚨 ASIGNACIÓN DIRECTA: Ya no es NULL, es el ID validado.
                    'bookingIdFK' => $bookingId,
                    'storage_subscription_id' => $validatedData['storage_subscription_id'] ?? null,
                    'path' => $path,
                    'thumbnail_path' => null,
                    'original_name' => $photo->getClientOriginalName(),
                    'size' => $photo->getSize(),
                ]);

                // 4. Armar respuesta
                $uploaded[] = [
                    'id' => $cloudPhoto->id,
                    'customerIdFK' => $cloudPhoto->customerIdFK,
                    'bookingIdFK' => $cloudPhoto->bookingIdFK, // 🚨 Este valor ahora es la ID
                    'path' => $cloudPhoto->path,
                    'url' => Storage::disk('s3')->url($cloudPhoto->path),
                    'original_name' => $cloudPhoto->original_name,
                    'size' => $cloudPhoto->size,
                    'created_at' => $cloudPhoto->created_at,
                ];

            } catch (Throwable $e) {
                // Manejar error de almacenamiento o DB para esta foto en particular
                \Log::error("Fallo al procesar foto: " . $e->getMessage());
                // Podrías devolver un error 500 o continuar con la siguiente foto.
                continue;
            }
        }

        return response()->json([
            'message' => 'Fotos subidas y guardadas correctamente.',
            'photos' => $uploaded,
        ], 201);

    }
    public function getPhotosByCustomer(int $customerId)
    {
        // 1. Verificar si el cliente tiene una suscripción de almacenamiento válida/no expirada
        // Buscamos una suscripción donde:
        // a) El customerIdFK coincida.
        // b) La fecha actual (now) sea menor o igual a la fecha de finalización (ends_at).

        $now = Carbon::now();

        $validSubscription = StorageSubscription::where('customerIdFK', $customerId)
            // La fecha de finalización es posterior o igual a la hora actual.
            ->where('ends_at', '>=', $now)
            // Opcional: Si quieres un status específico (ej: 'active' o 'pending') 
            // puedes agregarlo, pero 'ends_at' es la clave de tu lógica.
            // ->whereIn('status', ['active', 'cancelled']) // Si permites 'cancelled' hasta ends_at
            ->first();

        // 1b. Si no tiene una suscripción válida/no expirada, denegar el acceso.
        if (!$validSubscription) {
            return response()->json([
                'message' => 'Acceso denegado. El cliente no tiene una suscripción de almacenamiento vigente.',
                'photos' => [],
            ], 403); // Código 403 Forbidden para denegar el acceso
        }


        // 2. Obtener las fotos del cliente (solo si la verificación pasó)
        $photos = CloudPhoto::where('customerIdFK', $customerId)
            // Opcional: ordenar por fecha de subida
            ->orderBy('created_at', 'desc')
            ->get();

        // 3. Transformar los datos para incluir la URL pública
        $photosWithUrl = $photos->map(function ($photo) {
            // Se asume que Storage::disk('s3')->url() funciona correctamente con tu configuración de Contabo S3
            $url = Storage::disk('s3')->url($photo->path);

            return [
                'id' => $photo->id,
                'path' => $photo->path,
                'url' => $url, // ¡Esta es la clave!
                'original_name' => $photo->original_name,
                'size' => $photo->size,
                'created_at' => $photo->created_at,
            ];
        });

        // 4. Devolver la respuesta
        return response()->json([
            'message' => 'Fotos del cliente obtenidas correctamente.',
            'photos' => $photosWithUrl,
        ]);
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
