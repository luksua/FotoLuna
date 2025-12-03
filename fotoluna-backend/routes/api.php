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


// RUTAS SIN LOGIN
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/document-types', [DocumentTypeController::class, 'index']);
Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/availability', [AppointmentController::class, 'availability']);
Route::post('/email/resend', [AuthController::class, 'resendVerification']);
Route::post('/contact', [ContactController::class, 'store']);

// RUTAS COMUNES PARA CUALQUIER USUARIO AUTENTICADO
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [BookingActionsController::class, 'installmentReceipt']);
    Route::prefix('bookings/{booking}')->group(function () {
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);
    });
    // RUTA PARA ALMACENAR CITAS PARA CLIENTE Y EMPLEADO
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/appointmentsCustomer', [AppointmentController::class, 'storeCustomer']);
});
// RUTAS CLIENTE
Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);

    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);
    Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/appointments-customer', [AppointmentController::class, 'index']);

    Route::post('/bookings/{booking}/installments-plan', [BookingInstallmentController::class, 'createInstallmentsPlan']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::prefix('bookings/{booking}')->group(function () {
        Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/summary', [BookingController::class, 'summary']);
        Route::post('/send-confirmation', [BookingController::class, 'sendConfirmation']);
    });
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);
    Route::post('/mercadopago/storage/pay', [PaymentController::class, 'payStoragePlan']);
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
    Route::get('/storage-plans', [StoragePlanController::class, 'index']);
    Route::get('/storage-plans-customer', [StoragePlanController::class, 'indexCustomer']);
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);
    Route::get('/storage/dashboard', [StoragePlanController::class, 'index']);
    Route::post('/storage/change-plan', [StoragePlanController::class, 'changePlan']);
    Route::post('storage/cancel-subscription', [StoragePlanController::class, 'cancelSubscription']);
    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);
    Route::get('/api/document-types', [DocumentTypeController::class, 'index']);
    Route::get('/employees/available', [EmployeeController::class, 'available']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);
});
// Route::middleware('auth:sanctum')->group(function () {
//     Route::prefix('bookings/{booking}')->group(function () {
//         Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
//         Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
//         Route::get('/receipt', [BookingActionsController::class, 'receipt']);
//     });
// });
// Route::get('/employees/available', [EmployeeController::class, 'available']);

// ESTE
// Route::get('/storage-plans', [StoragePlanController::class, 'index']);

// Route::middleware('auth:sanctum')->get(
//     '/appointments-customer',
//     [AppointmentController::class, 'index']
// );

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get(
//         '/appointments/{appointment}/installments/{installment}/receipt',
//         [AppointmentController::class, 'downloadReceipt']
//     );
// });

// Route::get('/bookings/{booking}/summary', [BookingController::class, 'summary']);
// Route::post('/bookings/{booking}/send-confirmation', [BookingController::class, 'sendConfirmation']);

// Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);


/*
|--------------------------------------------------------------------------
| Rutas Autenticadas (Middleware: auth:sanctum)
|--------------------------------------------------------------------------
*/


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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/customer', [ProfileController::class, 'update']);
//     Route::post('/customer/password', [ProfileController::class, 'updatePassword']);
//     Route::post('/appointments', [AppointmentController::class, 'store']);
// });

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    // Route::post('/appointments', [AppointmentController::class, 'store']);
    // Route::get('/appointments-customer', [AppointmentController::class, 'index']);
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

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
});

Route::get('/storage-plans', [StoragePlanController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);
});

// Empleado
Route::middleware('auth:sanctum')->group(function () {
    // LISTAR citas de un empleado (calendario del fotógrafo)
    // Route::get('/employee/{employee}/appointments', [
    //     AppointmentController::class,
    //     'employeeAppointments',
    // ]);

    // ACTUALIZAR una cita desde el panel del empleado
    // Route::put('/employee/appointments/{appointment}', [
    //     AppointmentController::class,
    //     'updateByEmployee',
    // ]);

    // === CLIENTES (panel empleado / admin) ===

    // Lista de clientes (con filtro ?year=2024 opcional)
    // Route::get('/customers', [CustomerController::class, 'index']);

    // Detalle de un cliente para el modal "Ver más"
    // Route::get('/customers/{customer}', [CustomerController::class, 'show']);


    // --- Rutas del Empleado (Fotógrafo) ---
    Route::get('/employee/{employee}/appointments', [AppointmentController::class, 'employeeAppointments']); // Calendario
    Route::put('/employee/appointments/{appointment}', [AppointmentController::class, 'updateByEmployee']); // Actualizar cita
    Route::post('/employee/cloud-photos', [CloudPhotoController::class, 'store']); // Subir fotos
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']); // Pagos de empleado

    // --- Gestión y Búsqueda de Clientes (Panel) ---
    // 💡 NUEVA RUTA PARA AUTOCOMPLETADO
    Route::get('/customers/search', [CustomerController::class, 'search']);
    Route::get('/customers', [CustomerController::class, 'index']); // Lista de clientes
    Route::get('/customers/{customer}', [CustomerController::class, 'show']); // Detalle de cliente
});

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/employee/payments', [PaymentController::class, 'employeePayments']);
// });


// Admin Citas
Route::get('/admin/events', [AdminEventsController::class, 'index']);
Route::get('/admin/packages', [AdminPackagesController::class, 'index']);
Route::get('/admin/document-types', [AdminDocumentTypesController::class, 'index']);
Route::get('/employees/ratings', [EmployeeController::class, 'ratings']);
Route::get('/admin/employees', [AdminUsersController::class, 'index']);
Route::get('/admin/customers', [AdminUsersController::class, 'getCustomers']);
Route::get('/admin/employees', [AdminUsersController::class, 'index']);
Route::post('/admin/employees', [RegisterEmployeeController::class, 'store']);
Route::patch('/admin/employees/{id}/availability', [AdminUsersController::class, 'toggleAvailability']);
Route::patch('/admin/employees/{id}', [AdminUsersController::class, 'update']);
Route::get('/admin/customers/count', [AdminUsersController::class, 'getCustomersCount']);


Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

    // --- Gestión de Citas ---
    Route::get('/appointments', [AdminAppointmentController::class, 'index']);
    Route::get('/appointments/unassigned', [AdminAppointmentController::class, 'unassigned']);
    Route::get('/employees/availability', [AdminAppointmentController::class, 'employeesAvailability']);

    // Acciones de asignación
    Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);
    Route::post('/appointments/{appointment}/assign', [AdminAppointmentController::class, 'assign']);
    Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);

});

Route::get('/admin/packages', [AdminPackagesController::class, 'index']);

// Estadísticas de paquetes vendidos
Route::get('/admin/packages/stats', [AdminPackagesController::class, 'stats']);

// Ventas del mes actual
Route::get('/admin/packages/sales/monthly', [AdminPackagesController::class, 'monthlySales']);

// Citas pendientes de un usuario
Route::get('/admin/appointments/pending/{userId}', [AppointmentController::class, 'pendingByUserId']);

// Contar citas pendientes totales
Route::get('/admin/appointments/pending-count', [AppointmentController::class, 'getPendingCount']);

Route::get('admin/payments', [PaymentController::class, 'index']);
Route::get('adminpayments/summary', [PaymentController::class, 'summary']);

Route::get('adminstorage-plans', [StoragePlanController::class, 'indexAdmin']);
Route::put('adminstorage-plans/{id}', [StoragePlanController::class, 'update']);
// ===== COMENTARIOS (públicos + autenticados) =====
// Obtener todos los comentarios (público, sin autenticación)
Route::get('/comments', [CommentsController::class, 'index']);

// Obtener estadísticas de puntuaciones (público, para dashboard)
Route::get('/comments/ratings/stats', [CommentsController::class, 'ratings']);

// Crear comentario (requiere autenticación)
Route::middleware('auth:sanctum')->post('/comments', [CommentsController::class, 'store']);

// Eliminar comentario (requiere autenticación: propietario o admin)
Route::middleware('auth:sanctum')->delete('/comments/{comment}', [CommentsController::class, 'destroy']);


// Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

// });



// Route::middleware(['auth:sanctum', 'role:empleado'])->group(function () {
// Route::put('/employee/appointments/{appointmentId}', [AppointmentController::class, 'updateByEmployee']);
// });
// 
