<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\PaymentController; // Import PaymentController

Route::get('/phpinfo', function () {
    phpinfo();
});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    if (! $request->hasValidSignature()) {
        abort(403, 'Firma inválida o expirada');
    }

    $user = \App\Models\User::findOrFail($id);
    if (! hash_equals((string) $hash, sha1($user->email))) {
        abort(403, 'Hash no coincide');
    }

    if (is_null($user->email_verified_at)) {
        $user->email_verified_at = now();
        $user->save();
    }

    // Redirige al frontend (configura FRONTEND_URL en .env)
    $frontend = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect($frontend . '/email-verified?status=success');
})->name('verification.verify');

Route::get('/storage/{path}', [ImageController::class, 'show'])
    ->where('path', '.*');

// New route for employee payments, protected by sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']);
});