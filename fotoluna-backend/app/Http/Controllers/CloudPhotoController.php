<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CloudPhoto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Support\Facades\Validator;
use Throwable;
use App\Models\StorageSubscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Filesystem\Filesystem;
// Importaciones necesarias:


class CloudPhotoController extends Controller
{
    /**
     * Obtiene y lista TODAS las fotos de la nube. (Para uso de Administrador/Empleado)
     */
    public function index()
    {
        // 1. Obtener las fotos con JOINs para asociar el nombre de Evento/Plan
        $photos = CloudPhoto::
            leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid')
            ->leftJoin('storage_subscriptions', 'cloud_photos.storage_subscription_id', '=', 'storage_subscriptions.id')
            ->select(
                'cloud_photos.id',
                'cloud_photos.path',
                'cloud_photos.created_at',
                'cloud_photos.original_name',
                'cloud_photos.customerIdFK',
                'cloud_photos.size',
                DB::raw("COALESCE(
                    events.eventType, 
                    CASE 
                        WHEN storage_subscriptions.plan_id IS NOT NULL THEN CONCAT('Plan de Almacenamiento #', storage_subscriptions.plan_id)
                        ELSE 'Foto Individual'
                    END
                ) as event_name")
            )
            ->orderBy('cloud_photos.created_at', 'desc')
            ->get();

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        // 2. Mapear y generar la URL PÚBLICA (Firmada de 5 minutos)
        $photosWithUrl = $photos->map(function ($photo) use ($disk) {

            // USAMOS URL FIRMADA DE 5 MINUTOS PARA EL ADMINISTRADOR
            try {
                $url = $disk->temporaryUrl($photo->path, now()->addMinutes(5));
            } catch (Throwable $e) {
                $url = 'S3_SIGNING_ERROR: ' . substr($e->getMessage(), 0, 80);
            }

            return [
                'id' => $photo->id,
                'url' => $url,
                'event_name' => $photo->event_name,
                'created_at' => $photo->created_at->format('Y-m-d'),
                'original_name' => $photo->original_name,
                'customerIdFK' => $photo->customerIdFK,
                'size' => $photo->size,
            ];
        });

        return response()->json([
            'message' => 'Todas las fotos obtenidas correctamente.',
            'photos' => $photosWithUrl,
        ]);
    }

    /**
     * Subida de varias fotos al storage de Contabo (Empleados)
     */
    public function store(Request $request)
    {
        // 1. ✅ VALIDACIÓN
        $validatedData = $request->validate([
            'photos.*' => ['required', 'image', 'max:5120'],
            'event_name' => ['required', 'string'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'location' => ['required', 'string'],
            'linked_users' => ['nullable', 'string'],
            'employee_id' => ['required', 'integer', 'exists:users,id'],
            'customerIdFK' => ['required', 'integer', 'exists:customers,customerId'],
            'bookingIdFK' => ['nullable', 'integer', 'exists:bookings,bookingId'],
            // 'storage_subscription_id' ya no es necesario validarlo si lo buscamos en la DB
        ]);

        if (!$request->hasFile('photos')) {
            return response()->json(['message' => 'No se recibieron archivos.'], 422);
        }

        // 2. OBTENER VALORES y LÓGICA CLAVE
        $bookingId = $validatedData['bookingIdFK'] ?? null;
        $customerId = $validatedData['customerIdFK'];

        // 🚨 LÓGICA DE SUBSCRIPCIÓN CORREGIDA: BUSCAR LA SUSCRIPCIÓN ACTIVA EN LA DB
        $activeSubscription = StorageSubscription::where('customerIdFK', $customerId)
            ->where('ends_at', '>=', Carbon::now())
            ->orderBy('ends_at', 'desc')
            ->first();

        // Si existe, usamos su ID; si no, es NULL
        $subscriptionId = $activeSubscription ? $activeSubscription->id : null;

        $uploaded = [];

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        // 3. Subir y Guardar en BD
        foreach ($request->file('photos') as $photo) {

            try {
                // 🛑 LÍNEA CORREGIDA Y CLAVE: Llamar store() en el objeto $photo.
                // Esto sube el archivo real al disco 's3' y devuelve el path.
                $path = $photo->store('cloud_photos', 's3');

                // Asigna la visibilidad pública
                $disk->setVisibility($path, 'public');

                $cloudPhoto = CloudPhoto::create([
                    'customerIdFK' => $customerId,
                    'bookingIdFK' => $bookingId,
                    'storage_subscription_id' => $subscriptionId, // 🚨 Usa el ID encontrado en la DB
                    'path' => $path,
                    'thumbnail_path' => null,
                    'original_name' => $photo->getClientOriginalName(),
                    'size' => $photo->getSize(),
                ]);

                // 4. Armar respuesta
                $uploaded[] = [
                    'id' => $cloudPhoto->id,
                    'customerIdFK' => $cloudPhoto->customerIdFK,
                    'bookingIdFK' => $cloudPhoto->bookingIdFK,
                    'path' => $cloudPhoto->path,
                    'url' => $disk->url($cloudPhoto->path),
                    'original_name' => $cloudPhoto->original_name,
                    'size' => $cloudPhoto->size,
                    'created_at' => $cloudPhoto->created_at,
                ];

            } catch (Throwable $e) {
                // 🚨 DEVOLVER EL ERROR DE S3 PARA DEBUGGING
                $errorMessage = "Error de Subida/DB: " . substr($e->getMessage(), 0, 100);
                \Log::error("Fallo de subida de foto a Contabo: " . $e->getMessage());

                // Detener y devolver el error exacto de Contabo/AWS
                return response()->json([
                    'message' => 'Fallo en la subida de Contabo S3. Causa: ' . $errorMessage,
                    'status' => 'critical_upload_failed'
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Fotos subidas y guardadas correctamente.',
            'photos' => $uploaded,
        ], 201);
    }

    // ... (getPhotosByCustomer omitido por brevedad) ...

    /**
     * Obtiene fotos del cliente autenticado (Mi Galería)
     * 🚨 CORRECCIÓN FINAL: Asegura obtener el customerId correcto y aplica la lógica de acceso por suscripción general.
     */
    // En CloudPhotoController.php (dentro de la clase CloudPhotoController)

    public function getMyCloudPhotos()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Cliente no autenticado.'], 401);
        }

        $now = Carbon::now();

        // 🔑 1. OBTENER CUSTOMER ID REAL (CORRECCIÓN CRÍTICA PARA EL PROBLEMA 403)
        // Asumimos que el User (ID 6) tiene una relación 1:1 o 1:N con Customer (ID 2).
        // Buscamos el customerId usando el ID del usuario autenticado (6).
        // Si esta línea falla, necesitas importar App\Models\Customer.
        $customerRecord = \App\Models\Customer::where('user_id', $user->id)->first();

        $customerId = $customerRecord->customerId ?? $user->id; // Usamos el ID del cliente o el ID del usuario como fallback

        if (!$customerRecord) {
            // Si no se encuentra un Customer asociado, usamos el ID del usuario
            $customerId = $user->id;
        } else {
            $customerId = $customerRecord->customerId;
        }

        if (!$customerId) {
            return response()->json(['message' => 'Error de sesión. No se pudo identificar el ID del cliente.'], 401);
        }

        // 2. VERIFICACIÓN DE ACCESO INICIAL: ¿El cliente tiene ALGUNA suscripción activa?
        $validSubscription = StorageSubscription::where('customerIdFK', $customerId)
            ->where('ends_at', '>=', $now)
            ->where('status', 'active')
            ->first();

        if (!$validSubscription) {
            return response()->json([
                'message' => 'Acceso denegado. Para ver tus fotos, tu plan de almacenamiento debe estar activo o no expirado. Por favor, actualiza tu plan.',
                'photos' => [],
            ], 403);
        }

        // 3. OBTENER LAS FOTOS (La lógica de consulta flexible que ya implementaste)
        $photos = CloudPhoto::select(
            'cloud_photos.id',
            'cloud_photos.path',
            'cloud_photos.created_at',
            'cloud_photos.original_name',
            'cloud_photos.size',
            DB::raw("COALESCE(events.eventType, 'Foto Individual') as event_name")
        )
            ->where('cloud_photos.customerIdFK', $customerId)
            ->leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid')
            ->orderBy('cloud_photos.created_at', 'desc')
            ->get();

        // 4. Mapeo y generación de URL firmada (Mantenido)
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        $photosWithUrl = $photos->map(function ($photo) use ($disk) {
            $expirationTime = now()->addDays(6);
            try {
                $url = $disk->temporaryUrl($photo->path, $expirationTime);
            } catch (Throwable $e) {
                $errorMessage = "S3_SIGNING_ERROR: " . substr($e->getMessage(), 0, 80);
                \Log::error("Fallo S3 Signature: " . $photo->id . " - " . $e->getMessage());
                $url = $errorMessage;
            }

            return [
                'id' => $photo->id,
                'url' => $url,
                'event_name' => $photo->event_name,
                'created_at' => $photo->created_at->format('Y-m-d'),
                'original_name' => $photo->original_name,
                'size' => $photo->size,
            ];
        });

        return response()->json([
            'message' => 'Fotos obtenidas correctamente.',
            'photos' => $photosWithUrl,
        ]);
    }
    public function getCustomerCloudPhotos(Request $request, int $customerId)
    {
        // Dependencias (Se asumen importadas o se usan nombres completos)
        // StorageSubscription, Carbon, DB, CloudPhoto

        $now = Carbon::now();
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 20);
        $orderBy = $request->query('order_by', 'created_at'); // created_at, event_name
        $eventFilter = $request->query('event'); // Nombre del evento/plan

        // 1. ✅ VERIFICACIÓN DE ACCESO INICIAL: ¿El cliente tiene ALGUNA suscripción activa?
        $validSubscription = StorageSubscription::where('customerIdFK', $customerId)
            ->where('ends_at', '>=', $now)
            ->where('status', 'active')
            ->first();

        if (!$validSubscription) {
            // Error 403 (Forbidden) si la suscripción está inactiva.
            return response()->json([
                'message' => 'Acceso denegado. El plan de almacenamiento del cliente no está activo o expiró. Por favor, solicite al cliente que actualice su plan.',
                'photos' => [],
            ], 403);
        }

        // 2. ✅ OBTENER LAS FOTOS con filtros y paginación
        $photosQuery = CloudPhoto::select(
            'cloud_photos.id',
            'cloud_photos.path',
            'cloud_photos.created_at',
            'cloud_photos.original_name',
            'cloud_photos.size',
            // Usamos COALESCE para mostrar 'Foto Individual' si no hay un evento asociado
            DB::raw("COALESCE(events.eventType, 'Foto Individual') as event_name")
        )
            ->where('cloud_photos.customerIdFK', $customerId)
            ->leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid');

        // Aplicar Filtro de Evento
        if ($eventFilter && $eventFilter !== 'Todos') {
            // Filtrar usando el campo calculado 'event_name'
            $photosQuery->where(DB::raw("COALESCE(events.eventType, 'Foto Individual')"), $eventFilter);
        }

        // Aplicar Ordenación
        if ($orderBy === 'event_name') {
            // Ordenar por nombre del evento (alfabético)
            $photosQuery->orderBy(DB::raw("COALESCE(events.eventType, 'Foto Individual')"), 'asc');
        } else {
            // Por defecto: 'created_at' descendente (Más recientes)
            $photosQuery->orderBy('cloud_photos.created_at', 'desc');
        }

        // Paginación
        $photosPaginator = $photosQuery->paginate($perPage, ['*'], 'page', $page);

        // 3. ✅ Mapeo y generación de URL firmada (6 días de validez)
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        $photosWithUrl = $photosPaginator->getCollection()->map(function ($photo) use ($disk) {
            $expirationTime = now()->addDays(6);
            try {
                // Generar URL firmada temporal para acceder al S3
                $url = $disk->temporaryUrl($photo->path, $expirationTime);
            } catch (Throwable $e) {
                // Manejo de errores de firma de S3
                $errorMessage = "S3_SIGNING_ERROR: " . substr($e->getMessage(), 0, 80);
                \Log::error("Fallo S3 Signature: " . $photo->id . " - " . $e->getMessage());
                $url = $errorMessage;
            }

            return [
                'id' => $photo->id,
                'url' => $url,
                'event_name' => $photo->event_name,
                'created_at' => $photo->created_at->format('Y-m-d'),
                'original_name' => $photo->original_name,
                'size' => $photo->size,
            ];
        });

        // 4. ✅ Devolver la respuesta paginada
        return response()->json([
            'message' => 'Fotos obtenidas correctamente.',
            'photos' => $photosWithUrl,
            // Datos de paginación para el frontend
            'current_page' => $photosPaginator->currentPage(),
            'last_page' => $photosPaginator->lastPage(),
            'total' => $photosPaginator->total(),
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