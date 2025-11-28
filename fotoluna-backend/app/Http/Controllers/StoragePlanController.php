<?php

namespace App\Http\Controllers;

use App\Models\StoragePlan;
use Illuminate\Http\Request;
use App\Models\StorageSubscription;
use App\Models\Customer;
use App\Models\CloudPhoto;

class StoragePlanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user(); // o fija un user de prueba si aún no tienes login
        $customer = Customer::where('user_id', $user->id)->firstOrFail();

        $currentSubscription = StorageSubscription::with('plan')
            ->where('customerIdFK', $customer->customerId)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->latest('ends_at')
            ->first();

        $plans = StoragePlan::where('is_active', 1)
            ->orderBy('price')
            ->get();

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
                'totalPhotos'    => $totalPhotos,
                'totalSizeMb'    => round($totalSizeMb, 2),
                'maxPhotos'      => $maxPhotos,
                'maxStorageMb'   => $maxStorageMb,
                'photosPercent'  => round($photosPercent),
                'storagePercent' => round($storagePercent),
            ];
        }

        // por ahora sin método de pago
        $paymentMethod = null;

        return response()->json([
            'currentSubscription' => $currentSubscription,
            'plans'               => $plans,
            'usage'               => $usage,
            'paymentMethod'       => $paymentMethod,
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

        StorageSubscription::where('customerIdFK', $customer->customerId)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        $startsAt = now();
        $endsAt = now()->addMonths($plan->duration_months);

        StorageSubscription::create([
            'customerIdFK' => $customer->customerId,
            'plan_id'      => $plan->id,
            'starts_at'    => $startsAt,
            'ends_at'      => $endsAt,
            'status'       => 'active',
            'payment_id'   => null,
            'mp_payment_id'=> null,
        ]);

        // devolvemos el mismo JSON que dashboard
        return $this->dashboard($request);
    }
}
