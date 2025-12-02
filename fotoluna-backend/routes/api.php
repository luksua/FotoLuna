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
use App\Http\Controllers\ContactController;


// RUTAS SIN LOGIN
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/document-types', [DocumentTypeController::class, 'index']);
Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/availability', [AppointmentController::class, 'availability']);
Route::post('/contact', [ContactController::class, 'store']);

// RUTAS COMUNES PARA CUALQUIER USUARIO AUTENTICADO
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
});

// RUTAS CLIENTE
Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);
    Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/appointments-customer', [AppointmentController::class, 'index']);
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [BookingActionsController::class, 'installmentReceipt']);
    Route::post('/bookings/{booking}/installments-plan', [BookingInstallmentController::class, 'createInstallmentsPlan']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::prefix('bookings/{booking}')->group(function () {
        Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);
        Route::get('/summary', [BookingController::class, 'summary']);
        Route::post('/send-confirmation', [BookingController::class, 'sendConfirmation']);
    });
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);
    Route::post('/mercadopago/storage/pay', [PaymentController::class, 'payStoragePlan']);
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
    Route::get('/storage-plans', [StoragePlanController::class, 'index']);
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);
    Route::get('/storage/dashboard', [StoragePlanController::class, 'index']);
    Route::post('/storage/change-plan', [StoragePlanController::class, 'changePlan']);
    Route::post('storage/cancel-subscription', [StoragePlanController::class, 'cancelSubscription']);
    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);
    Route::get('/api/document-types', [DocumentTypeController::class, 'index']);
    Route::get('/employees/available', [EmployeeController::class, 'available']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);
});


// Route::post('/mercadopago/storage/pay', [PaymentController::class, 'payStoragePlan'])
//     ->middleware('auth:sanctum');


// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/storage/dashboard', [StoragePlanController::class, 'index']);
//     Route::post('/storage/change-plan', [StoragePlanController::class, 'changePlan']);
//     Route::post('storage/cancel-subscription', [StoragePlanController::class, 'cancelSubscription']);
// });


// Route::middleware('auth:sanctum')->group(function () {
//     Route::prefix('bookings/{booking}')->group(function () {
//         Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
//         Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
//         Route::get('/receipt', [BookingActionsController::class, 'receipt']);
//     });
// });

// Route::middleware('auth:sanctum')->group(function () {

//     Route::get('/notifications', [NotificationController::class, 'index']);
//     Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
//     Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

// });

// Route::middleware('auth:sanctum')->get(
//     '/appointments-customer',
//     [AppointmentController::class, 'index']
// );
// Route::middleware('auth:sanctum')->get(
//     '/appointments/{appointment}/installments/{installment}/receipt',
//     [BookingActionsController::class, 'installmentReceipt']
// );

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post(
//         '/bookings/{booking}/installments-plan',
//         [BookingInstallmentController::class, 'createInstallmentsPlan']
//     );
// });


// Route::middleware('auth:sanctum')->group(function () {
//     Route::get(
//         '/appointments/{appointment}/installments/{installment}/receipt',
//         [AppointmentController::class, 'downloadReceipt']
//     );
// });

// Route::get('/bookings/{booking}/summary', [BookingController::class, 'summary']);
// Route::post('/bookings/{booking}/send-confirmation', [BookingController::class, 'sendConfirmation']);

// Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);


// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/mercadopago/checkout/pay', [MercadoPagoController::class, 'pay']);
// });

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





// Route::middleware('auth:sanctum')->get('/bookings/{booking}', [BookingController::class, 'show']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::get('/me', [AuthController::class, 'me']);
// });



// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/customer', [ProfileController::class, 'update']);
//     Route::post('/customer/password', [ProfileController::class, 'updatePassword']);
//     Route::post('/appointments', [AppointmentController::class, 'store']);
// });

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/packages', [PackageController::class, 'index']);
//     Route::post('/appointments', [AppointmentController::class, 'store']);
//     Route::get('/appointments-customer', [AppointmentController::class, 'index']);
//     Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
//     Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);



Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);

Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);

Route::get('/availability', [AppointmentController::class, 'availability']);
Route::get('/events', [EventController::class, 'index']);

Route::get('/api/document-types', [DocumentTypeController::class, 'index']);

Route::get('/employees/available', [EmployeeController::class, 'available']);
// Ruta pública para obtener todos los empleados (selector de fotógrafo)
Route::get('/employees/all', [EmployeeController::class, 'all']);

Route::post('/email/resend', [AuthController::class, 'resendVerification']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);
});

// Route::get('/storage-plans', [StoragePlanController::class, 'index']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);
// });

/////////////////////////////  (admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/employees', [RegisterEmployeeController::class, 'store']);
    

    Route::get('/admin/employees', [AdminUsersController::class, 'index']);

    Route::get('/admin/customers', [AdminUsersController::class, 'getCustomers']);

    Route::patch('/admin/employees/{id}/availability', [AdminUsersController::class, 'toggleAvailability']);

    Route::patch('/admin/employees/{id}', [AdminUsersController::class, 'update']);


    Route::get('/admin/events', [AdminEventsController::class, 'index']);

    Route::post('/admin/events', [AdminEventsController::class, 'store']);

    Route::patch('/admin/events/{id}', [AdminEventsController::class, 'update']);

    Route::patch('/admin/events/{id}/status', [AdminEventsController::class, 'updateStatus']);


    Route::get('/admin/packages', [AdminPackagesController::class, 'index']);

    Route::post('/admin/packages', [AdminPackagesController::class, 'store']);

    Route::patch('/admin/packages/{id}', [AdminPackagesController::class, 'update']);

    Route::patch('/admin/packages/{id}/status', [AdminPackagesController::class, 'updateStatus']);


    Route::get('/admin/document-types', [AdminDocumentTypesController::class, 'index']);

    Route::post('/admin/document-types', [AdminDocumentTypesController::class, 'store']);

    Route::patch('/admin/document-types/{id}', [AdminDocumentTypesController::class, 'update']);

    Route::patch('/admin/document-types/{id}/status', [AdminDocumentTypesController::class, 'updateStatus']);
});

// Empleado
Route::middleware('auth:sanctum')->group(function () {
    // LISTAR citas de un empleado (calendario del fotógrafo)
    Route::get('/employee/{employee}/appointments', [
        AppointmentController::class,
        'employeeAppointments',
    ]);

    // ACTUALIZAR una cita desde el panel del empleado
    Route::put('/employee/appointments/{appointment}', [
        AppointmentController::class,
        'updateByEmployee',
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']);
});




// === CLIENTES (panel empleado / admin) ===
Route::middleware('auth:sanctum')->group(function () {
    // Lista de clientes (con filtro ?year=2024 opcional)
    Route::get('/customers', [CustomerController::class, 'index']);

    // Detalle de un cliente para el modal "Ver más"
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
});





// Admin Citas

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

    // Citas sin asignar (esto ya lo tienes)
    Route::get('/appointments/unassigned', [AdminAppointmentController::class, 'unassigned']);

    // Disponibilidad general de empleados (ya funciona)
    Route::get('/employees/availability', [AdminAppointmentController::class, 'employeesAvailability']);

    // 👉 NUEVA: todas las citas para el admin (tabla principal)
    Route::get('/appointments', [AdminAppointmentController::class, 'index']);

    // 👉 NUEVA: candidatos para una cita concreta (para el modal)
    Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);

    // 👉 NUEVA: asignar fotógrafo a una cita
    Route::post('/appointments/{appointment}/assign', [AdminAppointmentController::class, 'assign']);

});

    Route::get('admin/payments', [PaymentController::class, 'index']);
    Route::get('adminpayments/summary', [PaymentController::class, 'summary']);
    
    Route::get('adminstorage-plans', [StoragePlanController::class, 'indexAdmin']);
    Route::put('adminstorage-plans/{id}', [StoragePlanController::class, 'update']);
// ===== COMENTARIOS (públicos + autenticados) =====
// Obtener todos los comentarios (público, sin autenticación)
Route::get('/comments', [CommentsController::class, 'index']);

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
