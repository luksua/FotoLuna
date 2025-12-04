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
use App\Http\Controllers\StoragePlanController;
use App\Http\Controllers\StorageSubscriptionController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BookingActionsController;
use App\Http\Controllers\BookingInstallmentController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\Admin\RegisterEmployeeController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\Admin\AdminEventsController;
use App\Http\Controllers\Admin\AdminPackagesController;
use App\Http\Controllers\Admin\AdminDocumentTypesController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminAppointmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CloudPhotoController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| RUTAS PUBLICAS (SIN LOGIN)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/document-types', [DocumentTypeController::class, 'index']);

Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);
Route::get('/events', [EventController::class, 'index']);

Route::get('/availability', [AppointmentController::class, 'availability']);

// Empleados públicos (selector en landing / filtros)
Route::get('/employees/available', [EmployeeController::class, 'available']);
Route::get('/employees/all', [EmployeeController::class, 'all']);
Route::get('/employees/ratings', [EmployeeController::class, 'ratings']);

// Planes de almacenamiento (listado público)
Route::get('/storage-plans', [StoragePlanController::class, 'index']);

// Reenvío de email de verificación (público)
Route::post('/email/resend', [AuthController::class, 'resendVerification']);

// Formulario de contacto
Route::post('/contact', [ContactController::class, 'store']);

// Comentarios públicos
Route::get('/comments', [CommentsController::class, 'index']);
Route::get('/comments/ratings/stats', [CommentsController::class, 'ratings']);

/*
|--------------------------------------------------------------------------
| RUTAS COMUNES PARA CUALQUIER USUARIO AUTENTICADO
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Autenticación básica
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Perfil (cualquier usuario autenticado)
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Recibo de una cuota (cualquier usuario autenticado que tenga permiso)
    Route::get(
        '/appointments/{appointment}/installments/{installment}/receipt',
        [BookingActionsController::class, 'installmentReceipt']
    );

    // Pagos (MercadoPago / offline)
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/mercadopago/storage/pay', [PaymentController::class, 'payStoragePlan']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);

    // Usuario autenticado actual (helper)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Pagos del empleado (panel empleado)
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']);

    // Gestión de clientes (panel empleado / admin)
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/search', [CustomerController::class, 'search']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| RUTAS CLIENTE (ROLE:cliente)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {

    // Citas (cliente)
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/appointmentsCustomer', [AppointmentController::class, 'storeCustomer']); // si se usa
    Route::get('/appointments-customer', [AppointmentController::class, 'index']);

    // Actualización de cita (cliente)
    Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);

    // Paquetes
    Route::get('/packages', [PackageController::class, 'index']);

    // Reserva de una cita
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);

    // Booking: detalle y acciones
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);

    Route::prefix('bookings/{booking}')->group(function () {
        // Acciones sobre la reserva
        Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);

        // Resumen de la reserva
        Route::get('/summary', [BookingController::class, 'summary']);
    });

    // Planes de cuotas
    Route::post(
        '/bookings/{booking}/installments-plan',
        [BookingInstallmentController::class, 'createInstallmentsPlan']
    );

    // Actualizar booking
    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);

    // Recibos de pago
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);

    // Storage (cliente)
    Route::get('/storage-plans-customer', [StoragePlanController::class, 'indexCustomer']);
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);
    Route::get('/storage/dashboard', [StoragePlanController::class, 'index']);
    Route::post('/storage/change-plan', [StoragePlanController::class, 'changePlan']);
    Route::post('/storage/cancel-subscription', [StoragePlanController::class, 'cancelSubscription']);

    // Documentos y empleados filtrables desde el frontend del cliente
    Route::get('/api/document-types', [DocumentTypeController::class, 'index']);
    Route::get('/employees/available', [EmployeeController::class, 'available']);

    // Reenvío de email (si el cliente ya está logueado)
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);
});

/*
|--------------------------------------------------------------------------
| RUTAS EMPLEADO (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Calendario del empleado (fotógrafo)
    Route::get('/employee/{employee}/appointments', [
        AppointmentController::class,
        'employeeAppointments',
    ]);

    // Actualizar cita desde panel del empleado
    Route::put('/employee/appointments/{appointment}', [
        AppointmentController::class,
        'updateByEmployee',
    ]);

    // Subir fotos al cloud desde panel empleado
    Route::post('/employee/cloud-photos', [CloudPhotoController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| RUTAS ADMIN (auth:sanctum) sin prefix()
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Gestión de empleados
    Route::post('/admin/employees', [RegisterEmployeeController::class, 'store']);
    Route::get('/admin/employees', [AdminUsersController::class, 'index']);
    Route::patch('/admin/employees/{id}/availability', [AdminUsersController::class, 'toggleAvailability']);
    Route::patch('/admin/employees/{id}', [AdminUsersController::class, 'update']);

    // Gestión de clientes
    Route::get('/admin/customers', [AdminUsersController::class, 'getCustomers']);
    Route::get('/admin/customers/count', [AdminUsersController::class, 'getCustomersCount']);

    // Gestión de eventos
    Route::get('/admin/events', [AdminEventsController::class, 'index']);
    Route::post('/admin/events', [AdminEventsController::class, 'store']);
    Route::patch('/admin/events/{id}', [AdminEventsController::class, 'update']);
    Route::patch('/admin/events/{id}/status', [AdminEventsController::class, 'updateStatus']);

    // Gestión de paquetes
    Route::get('/admin/packages', [AdminPackagesController::class, 'index']);
    Route::get('/admin/packages/stats', [AdminPackagesController::class, 'stats']);
    Route::get('/admin/packages/sales/monthly', [AdminPackagesController::class, 'monthlySales']);
    Route::post('/admin/packages', [AdminPackagesController::class, 'store']);
    Route::patch('/admin/packages/{id}', [AdminPackagesController::class, 'update']);
    Route::patch('/admin/packages/{id}/status', [AdminPackagesController::class, 'updateStatus']);

    // Citas pendientes (estadísticas admin)
    Route::get('/admin/appointments/pending/{userId}', [AppointmentController::class, 'pendingByUserId']);
    Route::get('/admin/appointments/pending-count', [AppointmentController::class, 'getPendingCount']);

    // Tipos de documento (admin)
    Route::get('/admin/document-types', [AdminDocumentTypesController::class, 'index']);
    Route::post('/admin/document-types', [AdminDocumentTypesController::class, 'store']);
    Route::patch('/admin/document-types/{id}', [AdminDocumentTypesController::class, 'update']);
    Route::patch('/admin/document-types/{id}/status', [AdminDocumentTypesController::class, 'updateStatus']);

    // Pagos admin
    Route::get('/admin/payments', [PaymentController::class, 'index']);
    Route::get('/admin/payments/summary', [PaymentController::class, 'summary']);

    // Planes de almacenamiento (admin)
    Route::get('/admin/storage-plans', [StoragePlanController::class, 'indexAdmin']);
    Route::put('/admin/storage-plans/{id}', [StoragePlanController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| RUTAS ADMIN CON PREFIJO /admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Citas sin asignar
    Route::get('/appointments/unassigned', [AdminAppointmentController::class, 'unassigned']);

    // Disponibilidad de empleados
    Route::get('/employees/availability', [AdminAppointmentController::class, 'employeesAvailability']);

    // Todas las citas para el admin
    Route::get('/appointments', [AdminAppointmentController::class, 'index']);

    // Candidatos para una cita
    Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);

    // Asignar fotógrafo a una cita
    Route::post('/appointments/{appointment}/assign', [AdminAppointmentController::class, 'assign']);

    // Estadísticas de paquetes asociados a citas
    Route::get('/packages/count-booked', [AdminAppointmentController::class, 'packagesCount']);

    // Ventas por mes
    Route::get('/sales/by-month', [AdminAppointmentController::class, 'salesByMonth']);

    // Pagos de bookings (panel admin)
    Route::get('/booking-payments', [PaymentController::class, 'bookingPayments']);

    Route::get('/appointments/next', [AdminAppointmentController::class, 'next']);
});

/*
|--------------------------------------------------------------------------
| RUTAS DE COMENTARIOS (AUTENTICADAS)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/comments', [CommentsController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentsController::class, 'destroy']);
});
