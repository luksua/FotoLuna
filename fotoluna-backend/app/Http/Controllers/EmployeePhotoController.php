<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use Illuminate\Filesystem\FilesystemAdapter;
use App\Models\CloudPhoto;
use App\Models\Customer;
use Illuminate\Contracts\Filesystem\Filesystem;
use Throwable;
use App\Models\Employee;

class EmployeePhotoController extends Controller
{
    // Tiempo de vida de la URL firmada para miniaturas/previsualización en la interfaz.
    private const SIGNED_URL_EXPIRY_MINUTES = 5;
    private const SIGNED_URL_DOWNLOAD_MINUTES = 60;

    /**
     * Devuelve el adaptador de disco S3.
     */
    private function getDisk(): Filesystem
    {
        return Storage::disk('s3');
    }

    /**
     * GET /api/employee/photos/summary
     * Devuelve el historial de fotos subidas por el empleado autenticado en los últimos 15 días, agrupadas por cliente.
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        // 1. Mapeo user_id -> employeeId (Obtener el ID que realmente se guarda en la DB)
        $employeeRecord = Employee::where('user_id', $user->id)->first();
        $employeeId = $employeeRecord ? $employeeRecord->employeeId : null;

        if (!$employeeId) {
            return response()->json([], 200);
        }

        $dateLimit = Carbon::now()->subDays(15);
        $disk = $this->getDisk();

        // 2. Consulta de agregación: Total de fotos y última subida por cliente en el rango de 15 días
        $summaryData = CloudPhoto::select([
            'customerIdFK',
            DB::raw('COUNT(*) as totalPhotos'),
            DB::raw('MAX(created_at) as lastUploadAt'),
        ])
            // 🚨 CORRECCIÓN CRÍTICA: FILTRAR POR LA COLUMNA QUE ACABAS DE POBLAR
            ->where('uploaded_by_employee_id', $employeeId)
            ->where('created_at', '>=', $dateLimit)
            ->groupBy('customerIdFK')
            ->get();

        // 3. Transformación para obtener el nombre del cliente y las miniaturas
        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = $disk;

        $customerIds = $summaryData->pluck('customerIdFK');
        $customers = Customer::whereIn('customerId', $customerIds)
            ->select('customerId', 'firstNameCustomer', 'lastNameCustomer')
            ->get()
            ->keyBy('customerId');

        $result = $summaryData->map(function ($item) use ($employeeId, $dateLimit, $diskAdapter, $customers) {

            $customer = $customers->get($item->customerIdFK);
            if (!$customer)
                return null;

            // 4. Obtener las últimas 9 fotos subidas
            $recentPhotos = CloudPhoto::select('cloud_photos.*')
                // 🚨 FILTRO CLAVE: Usamos la columna directa
                ->where('uploaded_by_employee_id', $employeeId)
                ->where('customerIdFK', $item->customerIdFK)
                ->where('created_at', '>=', $dateLimit)
                ->orderBy('created_at', 'desc')
                ->take(9)
                ->get();

            // Lógica de mapeo de recentPhotos y retorno
            return [
                'customerId' => $item->customerIdFK,
                'customerName' => trim($customer->firstNameCustomer . ' ' . $customer->lastNameCustomer),
                'totalRecentPhotos' => (int) $item->totalPhotos,
                'lastUploadAt' => Carbon::parse($item->lastUploadAt)->toISOString(),

                'recentPhotos' => $recentPhotos->map(function ($p) use ($diskAdapter) {
                    try {
                        $url = $diskAdapter->temporaryUrl($p->path, Carbon::now()->addMinutes(self::SIGNED_URL_EXPIRY_MINUTES));
                    } catch (Throwable $e) {
                        $url = '';
                    }
                    return [
                        'id' => $p->id,
                        'url' => $url,
                        'thumbnailUrl' => $url,
                        'uploadedAt' => $p->created_at->toISOString(),
                        'bookingId' => $p->bookingIdFK,
                    ];
                })->toArray(),
            ];
        })->filter()->values();

        return response()->json($result);
    }

    /**
     * GET /api/employee/customers/{customerId}/photos/recent
     * Devuelve todas las fotos de un cliente subidas por el empleado autenticado en los últimos 15 días (vista detalle).
     */
    public function recentPhotosByCustomer(Request $request, $customerId)
    {
        $user = $request->user();
        // 1. Mapeo user_id -> employeeId
        $employeeRecord = Employee::where('user_id', $user->id)->first();
        $employeeId = $employeeRecord ? $employeeRecord->employeeId : null;

        if (!$employeeId) {
            return response()->json(['message' => 'El usuario no está vinculado a un empleado activo.'], 403);
        }

        $dateLimit = Carbon::now()->subDays(15);
        $disk = $this->getDisk();
        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = $disk;

        // 1. Obtener el nombre del cliente
        $customer = Customer::find($customerId);
        $customerName = $customer ? trim("{$customer->firstNameCustomer} {$customer->lastNameCustomer}") : 'Cliente Desconocido';


        // 2. Consulta de todas las fotos
        $photos = CloudPhoto::select('cloud_photos.*', 'events.eventType as event_name')
            ->leftJoin('bookings', 'cloud_photos.bookingIdFK', '=', 'bookings.bookingId')
            ->leftJoin('events', 'bookings.packageIdFK', '=', 'events.eventid')
            // 🚨 FILTRO CLAVE: Usamos la columna directa
            ->where('cloud_photos.uploaded_by_employee_id', $employeeId)
            ->where('cloud_photos.customerIdFK', $customerId)
            ->where('cloud_photos.created_at', '>=', $dateLimit)
            ->orderBy('cloud_photos.created_at', 'desc')
            ->get();

        // 3. Mapear y transformar los datos
        $data = $photos->map(function ($photo) use ($diskAdapter) {
            try {
                $url = $diskAdapter->temporaryUrl($photo->path, Carbon::now()->addMinutes(self::SIGNED_URL_DOWNLOAD_MINUTES));
            } catch (Throwable $e) {
                \Log::error("Fallo al firmar URL S3 para foto ID {$photo->id} para descarga: " . $e->getMessage());
                $url = 'S3_SIGNING_ERROR';
            }

            return [
                'id' => $photo->id,
                'url' => $url,
                'name' => $photo->original_name,
                'uploaded_at' => $photo->created_at->toISOString(),
                'size' => $photo->size,
                'customerIdFK' => $photo->customerIdFK,
                'event_name' => $photo->event_name ?? 'Sin Evento',
            ];
        });

        // 4. Devolver la respuesta
        return response()->json([
            'message' => 'Fotos recientes obtenidas correctamente.',
            'customerName' => $customerName,
            'photos' => $data,
        ]);
    }
}