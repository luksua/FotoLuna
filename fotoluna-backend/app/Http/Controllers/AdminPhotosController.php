<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\CloudPhoto;
use App\Models\Customer;
// 🚨 NECESARIO: Importar Carbon para 'now()' y manipulación de fechas
use Carbon\Carbon;
// 🚨 NECESARIO: Importar la interfaz para el type hinting correcto del disco
use Illuminate\Filesystem\FilesystemAdapter;

class AdminPhotosController extends Controller
{
    /**
     * Obtiene resumen organizado por cliente:
     * - total de fotos
     * - última subida
     * - fotos recientes (máx 9)
     * - URL firmada S3
     */
    public function summary()
    {
        // Traer fotos con su cliente
        $photos = CloudPhoto::with('customer')
            ->orderByDesc('created_at')
            ->get();

        // 🚨 CORRECCIÓN 1: Establecer el disco S3 y el type hinting PHPDoc
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('s3');

        // Agrupar por cliente
        $grouped = $photos->groupBy('customerIdFK');

        $result = $grouped->map(function ($photos, $customerId) use ($disk) {

            $customer = Customer::find($customerId);

            if (!$customer) {
                return null;
            }

            $total = $photos->count();
            // Utilizamos el objeto Carbon para obtener la fecha, aunque Eloquent lo hace automáticamente.
            $lastUpload = $photos->max('created_at');

            // 9 fotos recientes
            $recent = $photos->sortByDesc('created_at')
                ->take(9)
                ->values()
                ->map(function ($p) use ($disk) {
                    // Usamos try-catch en caso de que la foto no exista en S3
                    try {
                        // Usamos 5 minutos para previsualización admin
                        $url = $disk->temporaryUrl(
                            $p->path,
                            Carbon::now()->addMinutes(5)
                        );
                    } catch (\Throwable $e) {
                        // Fallback si la firma falla, necesario porque la URL estática es privada
                        \Log::warning("No se pudo firmar URL S3 para foto ID {$p->id}. Causa: " . $e->getMessage());
                        $url = ''; // Devolver vacío si hay error
                    }

                    return [
                        'id' => $p->id,
                        'url' => $url,
                        'uploadedAt' => $p->created_at->toISOString(),
                        'bookingId' => $p->bookingIdFK,
                        'customerIdFK' => $p->customerIdFK,
                        'size' => $p->size, // Incluir tamaño
                        'name' => $p->original_name, // Incluir nombre original
                    ];
                });

            return [
                'customerId' => $customer->customerId,
                'customerName' => trim($customer->firstNameCustomer . ' ' . $customer->lastNameCustomer),
                'totalPhotos' => $total,
                'lastUploadAt' => $lastUpload ? $lastUpload->toISOString() : null,
                'recentPhotos' => $recent,
            ];
        })->filter()->values();

        return response()->json($result);
    }
}