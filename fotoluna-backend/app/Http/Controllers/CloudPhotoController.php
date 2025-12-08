<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CloudPhoto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Events\PhotoUploaded;
use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Support\Facades\Validator;
use Throwable;
use App\Models\StorageSubscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Filesystem\Filesystem;
use App\Models\Employee; // Importar Employee para mapeo de ID
use Illuminate\Filesystem\FilesystemAdapter; // 🚨 NECESARIO para temporaryUrl, url y download

class CloudPhotoController extends Controller
{
    /**
     * Obtiene y lista TODAS las fotos de la nube. (Para uso de Administrador/Empleado)
     */
    public function index()
    {
        // 1. Obtener las fotos con JOINs para asociar el nombre de Evento/Plan y Empleado
        $photos = CloudPhoto::
            leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid')
            ->leftJoin('storage_subscriptions', 'cloud_photos.storage_subscription_id', '=', 'storage_subscriptions.id')
            // JOINS para obtener el nombre del empleado que SUBIÓ la foto
            ->leftJoin('employees', 'cloud_photos.uploaded_by_employee_id', '=', 'employees.employeeId')
            ->leftJoin('users', 'employees.user_id', '=', 'users.id')

            ->select(
                'cloud_photos.*',
                DB::raw("COALESCE(
                    events.eventType, 
                    CASE 
                        WHEN storage_subscriptions.plan_id IS NOT NULL THEN CONCAT('Plan de Almacenamiento #', storage_subscriptions.plan_id)
                        ELSE 'Foto Individual'
                    END
                ) as event_name"),
                // Campo añadido para el nombre del empleado uploader
                'users.name as employee_name'
            )
            ->orderBy('cloud_photos.created_at', 'desc')
            ->get();

        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk('s3');

        // 2. Mapear y generar la URL PÚBLICA (Firmada de 5 minutos)
        $photosWithUrl = $photos->map(function ($photo) use ($diskAdapter) {

            // USAMOS URL FIRMADA DE 5 MINUTOS PARA EL ADMINISTRADOR
            try {
                // 🚨 CORRECCIÓN PHP0418: Usamos $diskAdapter
                $url = $diskAdapter->temporaryUrl($photo->path, now()->addMinutes(5));
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
                'employee_name' => $photo->employee_name ?? 'No asignado',
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
        // 1. VALIDACIÓN
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
        ]);

        if (!$request->hasFile('photos')) {
            return response()->json(['message' => 'No se recibieron archivos.'], 422);
        }

        // 2. OBTENER VALORES y LÓGICA CLAVE
        $bookingId = $validatedData['bookingIdFK'] ?? null;
        $customerId = $validatedData['customerIdFK'];
        $userId = $validatedData['employee_id'];

        // ✨ CORRECCIÓN CRÍTICA: Mapear user_id -> employeeId
        $employeeRecord = Employee::where('user_id', $userId)->first();
        $employeeId = $employeeRecord ? $employeeRecord->employeeId : null;

        if (!$employeeId) {
            \Log::error("Fallo de subida: No se pudo obtener employeeId para user_id: {$userId}.");
            return response()->json(['message' => 'El usuario autenticado no está configurado como Empleado.'], 403);
        }

        // --- Lógica de Suscripción (Mantenida) ---
        $activeSubscription = StorageSubscription::where('customerIdFK', $customerId)
            ->where('ends_at', '>=', Carbon::now())
            ->orderBy('ends_at', 'desc')
            ->first();
        $subscriptionId = $activeSubscription ? $activeSubscription->id : null;

        $uploaded = [];
        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk('s3');

        // 3. Subir y Guardar en BD
        foreach ($request->file('photos') as $photo) {
            try {
                $path = $photo->store('cloud_photos', 's3');
                $diskAdapter->setVisibility($path, 'public');

                $cloudPhoto = CloudPhoto::create([
                    'customerIdFK' => $customerId,
                    'bookingIdFK' => $bookingId,
                    'storage_subscription_id' => $subscriptionId,
                    'uploaded_by_employee_id' => $employeeId, // ✅ Se guarda el ID del subidor
                    'path' => $path,
                    'thumbnail_path' => null,
                    'original_name' => $photo->getClientOriginalName(),
                    'size' => $photo->getSize(),
                ]);

                // 4. Armar respuesta
                $uploaded[] = [
                    'id' => $cloudPhoto->id,
                    // 🚨 CORRECCIÓN: Se usa $diskAdapter para resolver el error PHP0418
                    'url' => $diskAdapter->url($cloudPhoto->path),
                    'original_name' => $cloudPhoto->original_name,
                ];

                event(new PhotoUploaded($employeeRecord, $cloudPhoto));

            } catch (Throwable $e) {
                $errorMessage = "Error de Subida/DB: " . substr($e->getMessage(), 0, 100);
                \Log::error("Fallo de subida de foto a Contabo: " . $e->getMessage());
                return response()->json(['message' => 'Fallo en la subida de Contabo S3. Causa: ' . $errorMessage], 500);
            }
        }

        return response()->json([
            'message' => 'Fotos subidas y guardadas correctamente.',
            'photos' => $uploaded,
        ], 201);
    }


    /**
     * Obtiene fotos del cliente autenticado (Mi Galería)
     */
    public function getMyCloudPhotos()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Cliente no autenticado.'], 401);
        }

        $now = Carbon::now();

        // 🔑 1. OBTENER CUSTOMER ID REAL
        $customerRecord = \App\Models\Customer::where('user_id', $user->id)->first();
        $customerId = $customerRecord->customerId ?? $user->id;

        if (!$customerRecord) {
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

        // 3. OBTENER LAS FOTOS 
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
        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk('s3');

        $photosWithUrl = $photos->map(function ($photo) use ($diskAdapter) {
            $expirationTime = now()->addDays(6);
            try {
                $url = $diskAdapter->temporaryUrl($photo->path, $expirationTime);
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

    /**
     * Obtiene la galería completa de un cliente específico (Usado por Admin/Employee).
     */
    public function getCustomerCloudPhotos(Request $request, int $customerId)
    {
        $user = $request->user();
        $now = Carbon::now();
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 20);
        $orderBy = $request->query('order_by', 'created_at');
        $eventFilter = $request->query('event');

        // 🚨 CORRECCIÓN: Si el usuario es un empleado, omitimos la verificación de la suscripción para evitar el 403.
        // Si el usuario no tiene rol de admin/empleado, se puede mantener la verificación,
        // pero asumimos que esta ruta está dentro del middleware de Empleado/Admin.

        // 1. ✅ VERIFICACIÓN DE ACCESO DE CLIENTE (OPCIONALMENTE COMENTADA)
        /*
        $validSubscription = StorageSubscription::where('customerIdFK', $customerId)
            ->where('ends_at', '>=', $now)
            ->where('status', 'active')
            ->first();

        if (!$validSubscription) {
            return response()->json([
                'message' => 'Acceso denegado. El plan de almacenamiento del cliente no está activo o expiró. Por favor, solicite al cliente que actualice su plan.',
                'photos' => [],
            ], 403);
        }
        */

        // 2. ✅ OBTENER LAS FOTOS con filtros y paginación
        $photosQuery = CloudPhoto::select(
            'cloud_photos.id',
            'cloud_photos.path',
            'cloud_photos.created_at',
            'cloud_photos.original_name',
            'cloud_photos.size',
            DB::raw("COALESCE(events.eventType, 'Foto Individual') as event_name"),
            'users.name as employee_name'
        )
            ->where('cloud_photos.customerIdFK', $customerId)
            ->leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid')
            // ✨ Obtener el nombre del empleado que SUBIÓ la foto
            ->leftJoin('employees', 'cloud_photos.uploaded_by_employee_id', '=', 'employees.employeeId')
            ->leftJoin('users', 'employees.user_id', '=', 'users.id');


        // Aplicar Filtro de Evento
        if ($eventFilter && $eventFilter !== 'Todos') {
            $photosQuery->where(DB::raw("COALESCE(events.eventType, 'Foto Individual')"), $eventFilter);
        }

        // Aplicar Ordenación
        if ($orderBy === 'event_name') {
            $photosQuery->orderBy(DB::raw("COALESCE(events.eventType, 'Foto Individual')"), 'asc');
        } else {
            $photosQuery->orderBy('cloud_photos.created_at', 'desc');
        }

        // Paginación
        $photosPaginator = $photosQuery->paginate($perPage, ['*'], 'page', $page);

        // 3. ✅ Mapeo y generación de URL firmada (6 días de validez)
        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk('s3');

        $photosWithUrl = $photosPaginator->getCollection()->map(function ($photo) use ($diskAdapter) {
            $expirationTime = now()->addDays(6);
            try {
                $url = $diskAdapter->temporaryUrl($photo->path, $expirationTime);
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
                'employee_name' => $photo->employee_name,
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function download(CloudPhoto $photo)
    {
        if (!Storage::disk('s3')->exists($photo->path)) {
            abort(404, 'El archivo no se encuentra en el almacenamiento.');
        }

        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk('s3');
        // 🚨 CORRECCIÓN PHP0418: Usamos $diskAdapter
        return $diskAdapter->download($photo->path, $photo->original_name);
    }
}