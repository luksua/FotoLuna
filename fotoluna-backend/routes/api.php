<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\MercadoPagoController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mercadopago/checkout/pay', [MercadoPagoController::class, 'pay']);
});

// use App\Http\Controllers\AdminController;
// use App\Http\Controllers\CustomerController;

// Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
//     Route::get('/admin/dashboard', [AdminController::class, 'index']);
// });

// Route::middleware(['auth:sanctum', 'ability:cliente'])->group(function () {
//     Route::get('/cliente/home', [CustomerController::class, 'index']);
// });

// Route::middleware(['auth:sanctum', 'ability:empleado'])->group(function () {
//     Route::get('/empleado/panel', [EmployeeController::class, 'index']);
// });


Route::get('/document-types', [DocumentTypeController::class, 'index']);

Route::middleware('auth:sanctum')->get('/bookings/{booking}', [BookingController::class, 'show']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);

});

    Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);

    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);

Route::get('/availability', [AppointmentController::class, 'availability']);
Route::get('/events', [EventController::class, 'index']);

Route::get('/api/document-types', [DocumentTypeController::class, 'index']);

Route::get('/employees/available', [EmployeeController::class, 'available']);

Route::post('/email/resend', [AuthController::class, 'resendVerification']);

use App\Http\Controllers\PaymentController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
});
