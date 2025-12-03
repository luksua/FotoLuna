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
use App\Http\Controllers\StoragePlanController;
use App\Http\Controllers\StorageSubscriptionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BookingActionsController;
use App\Http\Controllers\AdminAppointmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CloudPhotoController;

/*
|--------------------------------------------------------------------------
| Rutas Públicas (Sin Autenticación)
|--------------------------------------------------------------------------
*/

// --- Autenticación y Registro ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/resend', [AuthController::class, 'resendVerification']);

// --- Datos Públicos y Disponibilidad ---
Route::get('/document-types', [DocumentTypeController::class, 'index']);
Route::get('/availability', [AppointmentController::class, 'availability']);
Route::get('/employees/available', [EmployeeController::class, 'available']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);
Route::get('/storage-plans', [StoragePlanController::class, 'index']);

// --- Enlaces Públicos a Pagos/Reservas ---
Route::get('/bookings/{booking}/summary', [BookingController::class, 'summary']);
Route::post('/bookings/{booking}/send-confirmation', [BookingController::class, 'sendConfirmation']);
Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);


/*
|--------------------------------------------------------------------------
| Rutas Autenticadas (Middleware: auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // --- Autenticación y Sesión ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // --- Perfil y Configuracion (Clientes y Perfil Propio) ---
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);

    // --- Citas (Acciones Generales del Cliente/Sistema) ---
    Route::get('/appointments-customer', [AppointmentController::class, 'index']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [AppointmentController::class, 'downloadReceipt']);
    
    // --- Reservas (Bookings) ---
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);
    
    // Acciones específicas de Booking
    Route::prefix('bookings/{booking}')->group(function () {
        Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);
    });

    // --- Pagos y Suscripciones ---
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);

    // --- Rutas del Empleado (Fotógrafo) ---
    Route::get('/employee/{employee}/appointments', [AppointmentController::class, 'employeeAppointments']); // Calendario
    Route::put('/employee/appointments/{appointment}', [AppointmentController::class, 'updateByEmployee']); // Actualizar cita
    Route::post('/employee/cloud-photos', [CloudPhotoController::class, 'store']); // Subir fotos
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']); // Pagos de empleado

    Route::get('events-with-packages', [AppointmentController::class, 'getEventsWithPackages']); // Eventos con paquetes

    // --- Gestión y Búsqueda de Clientes (Panel) ---
    // 💡 NUEVA RUTA PARA AUTOCOMPLETADO
    Route::get('/customers/search', [CustomerController::class, 'search']);
    Route::get('/customers', [CustomerController::class, 'index']); // Lista de clientes
    Route::get('/customers/{customer}', [CustomerController::class, 'show']); // Detalle de cliente
    Route::get('/customers/{customer}/bookings', [CustomerController::class, 'bookings']); // Obtener reservas de un cliente
});


/*
|--------------------------------------------------------------------------
| Rutas de Administración (Middleware: auth:sanctum + Admin prefix)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

    // --- Gestión de Citas ---
    Route::get('/appointments', [AdminAppointmentController::class, 'index']);
    Route::get('/appointments/unassigned', [AdminAppointmentController::class, 'unassigned']);
    Route::get('/employees/availability', [AdminAppointmentController::class, 'employeesAvailability']);
   
    
    // Acciones de asignación
    Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);
    Route::post('/appointments/{appointment}/assign', [AdminAppointmentController::class, 'assign']);

});