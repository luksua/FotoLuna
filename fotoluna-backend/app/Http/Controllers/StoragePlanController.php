<?php

namespace App\Http\Controllers;

use App\Models\StoragePlan;
use Illuminate\Http\Request;
use App\Models\StorageSubscription;
use App\Models\Customer;
use App\Models\CloudPhoto;

class StoragePlanController extends Controller
{
    public function indexCustomer()
{
    $plans = StoragePlan::where('is_active', true)
        ->orderBy('price')
        ->get();

    return response()->json($plans);
}
    public function index(Request $request)
    {
        // Si ya estás usando /api/storage/dashboard para el front,
        // puedes hacer simplemente:
        return $this->dashboard($request);
    }

    public function indexAdmin()
    {
        return StoragePlan::orderBy('price')->get();
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $customer = Customer::where('user_id', $user->id)->firstOrFail();

        // 1) Intentar traer una suscripción ACTIVA vigente
        $currentSubscription = StorageSubscription::with('plan')
            ->where('customerIdFK', $customer->customerId)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->orderByDesc('starts_at')   // 👈 la más reciente
            ->first();

        // 2) Si no hay activa, buscar una CANCELLED vigente (cancelada pero corriendo)
        if (!$currentSubscription) {
            $currentSubscription = StorageSubscription::with('plan')
                ->where('customerIdFK', $customer->customerId)
                ->where('status', 'cancelled')
                ->where('ends_at', '>=', now())
                ->orderByDesc('starts_at')
                ->first();
        }

        // 3) Si por alguna razón ends_at ya pasó, marcar como expired
        if ($currentSubscription && $currentSubscription->ends_at < now()) {
            $currentSubscription->status = 'expired';
            $currentSubscription->save();
            $currentSubscription = null;
        }

        $plans = StoragePlan::where('is_active', true)->orderBy('price')->get();

        // Uso (si quieres mantenerlo como antes)
        $usage = null;
        if ($currentSubscription && $currentSubscription->plan) {
            $photosQuery = CloudPhoto::where('customerIdFK', $customer->customerId)
                ->where('storage_subscription_id', $currentSubscription->id);

            $totalPhotos = $photosQuery->count();
            $totalSizeBytes = $photosQuery->sum('size');
            $totalSizeMb = $totalSizeBytes ? $totalSizeBytes / 1024 / 1024 : 0;

            $maxPhotos = $currentSubscription->plan->max_photos;
            $maxStorageMb = $currentSubscription->plan->max_storage_mb;

            $photosPercent = $maxPhotos ? min(100, ($totalPhotos / $maxPhotos) * 100) : 0;
            $storagePercent = $maxStorageMb ? min(100, ($totalSizeMb / $maxStorageMb) * 100) : 0;

            $usage = [
                'totalPhotos' => $totalPhotos,
                'totalSizeMb' => round($totalSizeMb, 2),
                'maxPhotos' => $maxPhotos,
                'maxStorageMb' => $maxStorageMb,
                'photosPercent' => round($photosPercent),
                'storagePercent' => round($storagePercent),
            ];
        }

        $paymentMethod = null;

        return response()->json([
            'currentSubscription' => $currentSubscription,
            'plans' => $plans,
            'usage' => $usage,
            'paymentMethod' => $paymentMethod,
        ]);
    }

    public function changePlan(Request $request)
    {
        $request->validate([
            'plan_id' => ['required', 'exists:storage_plans,id'],
        ]);

        $user = $request->user();
        $customer = Customer::where('user_id', $user->id)->firstOrFail();
        $plan = StoragePlan::findOrFail($request->plan_id);

        // Cancelar la suscripción activa anterior (si hay)
        StorageSubscription::where('customerIdFK', $customer->customerId)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        $startsAt = now();
        $endsAt = now()->addMonths($plan->duration_months);

        StorageSubscription::create([
            'customerIdFK' => $customer->customerId,
            'plan_id' => $plan->id,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'active',
            'payment_id' => null,
            'mp_payment_id' => null,
        ]);

        // devolvemos el mismo JSON que dashboard
        return $this->dashboard($request);
    }

    public function cancelSubscription(Request $request)
    {
        $user = $request->user();
        $customer = Customer::where('user_id', $user->id)->firstOrFail();

        // ✅ Siempre usar customerIdFK = customer->customerId
        $subscription = StorageSubscription::where('customerIdFK', $customer->customerId)
            ->where('status', 'active')
            ->orderByDesc('starts_at')
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'No tienes una suscripción activa para cancelar.',
            ], 400);
        }

        // No tocamos ends_at, sigue vigente hasta esa fecha
        $subscription->status = 'cancelled';
        $subscription->save();

        return response()->json([
            'message' => 'Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta la fecha de vencimiento.',
        ], 200);
    }

    public function update(Request $request, StoragePlan $storagePlan)
    {
        \Log::info('DATA RECIBIDA:', $request->all());

        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'duration_months' => ['required', 'integer', 'min:1'],
            'price'           => ['required', 'min:0'],
            'max_photos'      => ['nullable', 'integer', 'min:1'],
            'max_storage_mb'  => ['nullable', 'integer', 'min:1'],
            'is_active'       => ['required', 'boolean'],
        ]);

        $storagePlan->update($data);

        return response()->json($storagePlan);
    }
}
