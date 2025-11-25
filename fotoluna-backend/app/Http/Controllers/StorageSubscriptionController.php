<?php

namespace App\Http\Controllers;

use App\Models\StorageSubscription;
use App\Models\StoragePlan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StorageSubscriptionController extends Controller
{
    public function createSubscription(Request $request)
    {
        $validated = $request->validate([
            'planId' => 'required|exists:storage_plans,id',
            'customerId' => 'required|exists:customers,customerId',
        ]);

        $plan = StoragePlan::findOrFail($validated['planId']);

        $start = Carbon::now();
        $end   = Carbon::now()->addMonths($plan->duration_months);

        $subscription = StorageSubscription::create([
            'customerIdFK'   => $validated['customerId'],
            'planIdFK'       => $validated['planId'],
            'start_date'     => $start,
            'end_date'       => $end,
            'payment_status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Plan seleccionado correctamente.',
            'subscription' => $subscription,
        ]);
    }
}
