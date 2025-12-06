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
<<<<<<< HEAD
use App\Http\Controllers\AdminPhotosController;
=======
use App\Http\Controllers\ContactController;

>>>>>>> origin/luna


// =========================================================================
// RUTAS ABIERTAS Y PÚBLICAS
// =========================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/resend', [AuthController::class, 'resendVerification']);
Route::post('/contact', [ContactController::class, 'store']);

// Lectura de datos públicos
Route::get('/document-types', [DocumentTypeController::class, 'index']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{eventId}/packages', [PackageController::class, 'getByEvent']);
Route::get('/availability', [AppointmentController::class, 'availability']);
Route::get('/storage-plans', [StoragePlanController::class, 'index']);
Route::get('/employees/available', [EmployeeController::class, 'available']); // ¿Es pública o autenticada? Se mantiene aquí si es pública.

// Rutas de estadísticas públicas (para dashboards sin login)
Route::get('/admin/events', [AdminEventsController::class, 'index']);
Route::get('/admin/packages', [AdminPackagesController::class, 'index']);
Route::get('/admin/document-types', [AdminDocumentTypesController::class, 'index']);
Route::get('/admin/packages/stats', [AdminPackagesController::class, 'stats']);
Route::get('/admin/packages/sales/monthly', [AdminPackagesController::class, 'monthlySales']);
Route::get('/comments', [CommentsController::class, 'index']);
Route::get('/comments/ratings/stats', [CommentsController::class, 'ratings']);

// =========================================================================
// RUTAS COMUNES (AUTH: SANCTUM) - Cliente y Empleado
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
<<<<<<< HEAD

    // Citas y Reservas
=======
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [BookingActionsController::class, 'installmentReceipt']);
    Route::prefix('bookings/{booking}')->group(function () {
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);
    });
    // RUTA PARA ALMACENAR CITAS PARA CLIENTE Y EMPLEADO
>>>>>>> origin/luna
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/appointmentsCustomer', [AppointmentController::class, 'storeCustomer']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::put('/bookings/{bookingId}', [BookingController::class, 'update']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [AppointmentController::class, 'downloadReceipt']);

    // Pagos
    Route::post('/mercadopago/checkout/pay', [PaymentController::class, 'pay']);
    Route::post('/bookings/{booking}/payments/offline', [PaymentController::class, 'storeOffline']);

    // Suscripciones y Planes
    Route::post('/storage/subscribe', [StorageSubscriptionController::class, 'createSubscription']);

    // Comentarios
    Route::post('/comments', [CommentsController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentsController::class, 'destroy']);

    // fotos miniatura en clientes de la interfaz de empleado
    // En api.php (dentro del grupo con auth:sanctum)

    // En api.php (Asegúrate de que está dentro del grupo de rutas AUTENTICADAS)
// ...
// Nueva ruta para que el Empleado/Admin pueda ver la galería de un Cliente específico
    Route::get('/employee/customers/{customerId}/cloud-photos', [CloudPhotoController::class, 'getCustomerCloudPhotos']);
    // ...

});

// =========================================================================
// RUTAS CLIENTE (ROLE: CLIENTE)
// =========================================================================
Route::middleware(['auth:sanctum', 'role:cliente'])->group(function () {
    // Perfil
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);

    // Galería
    Route::get('/client/my-cloud-photos', [CloudPhotoController::class, 'getMyCloudPhotos']);

    // Citas y Reservas
    Route::get('/appointments-customer', [AppointmentController::class, 'index']);
<<<<<<< HEAD
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update']); // Reemplazada por la de arriba si es Cliente. Mantengo por si hay conflicto de método.

    // Pagos y Facturación
=======

    Route::post('/bookings/{booking}/installments-plan', [BookingInstallmentController::class, 'createInstallmentsPlan']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::prefix('bookings/{booking}')->group(function () {
        Route::post('/send-confirmation', [BookingActionsController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/summary', [BookingController::class, 'summary']);
        Route::post('/send-confirmation', [BookingController::class, 'sendConfirmation']);
    });
>>>>>>> origin/luna
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt']);
    Route::post('/mercadopago/storage/pay', [PaymentController::class, 'payStoragePlan']);
    Route::get('/storage-plans-customer', [StoragePlanController::class, 'indexCustomer']);
    Route::get('/storage/dashboard', [StoragePlanController::class, 'index']);
    Route::post('/storage/change-plan', [StoragePlanController::class, 'changePlan']);
    Route::post('storage/cancel-subscription', [StoragePlanController::class, 'cancelSubscription']);
    Route::get('/appointments/{appointment}/installments/{installment}/receipt', [BookingActionsController::class, 'installmentReceipt']);
    Route::post('/bookings/{booking}/installments-plan', [BookingInstallmentController::class, 'createInstallmentsPlan']);

<<<<<<< HEAD
    // Acciones de Reserva
    Route::prefix('bookings/{booking}')->group(function () {
        Route::get('/summary', [BookingController::class, 'summary']);
        Route::post('/send-confirmation', [BookingController::class, 'sendConfirmation']);
        Route::get('/calendar-link', [BookingActionsController::class, 'calendarLink']);
        Route::get('/receipt', [BookingActionsController::class, 'receipt']);
    });
});
=======
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
>>>>>>> origin/luna

// =========================================================================
// RUTAS EMPLEADO / ADMIN
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
<<<<<<< HEAD
    // GALERÍA GLOBAL (Admin/Empleado)
    Route::get('/cloud-photos', [CloudPhotoController::class, 'index']);
=======
    Route::get('/packages', [PackageController::class, 'index']);
    // Route::post('/appointments', [AppointmentController::class, 'store']);
    // // Route::get('/appointments-customer', [AppointmentController::class, 'index']);
    // Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::post('/appointments/{appointmentId}/booking', [BookingController::class, 'store']);
>>>>>>> origin/luna

    // Subida
    Route::post('/employee/cloud-photos', [CloudPhotoController::class, 'store']); // Subir fotos

    // Rutas de Empleado (Fotógrafo)
    Route::get('/employee/{employee}/appointments', [AppointmentController::class, 'employeeAppointments']); // Calendario
    Route::put('/employee/appointments/{appointment}', [AppointmentController::class, 'updateByEmployee']); // Actualizar cita
    Route::get('/employee/payments', [PaymentController::class, 'employeePayments']); // Pagos de empleado

    // Rutas de Clientes (Panel de Empleado)
    Route::get('/customers', [CustomerController::class, 'index']); // Lista de clientes
    Route::get('/customers/search', [CustomerController::class, 'search']); // Búsqueda rápida
    Route::get('/customers/{customer}', [CustomerController::class, 'show']); // Detalle de cliente
    Route::get('/customers/{customer}/bookings', [CustomerController::class, 'bookings']); // Obtener reservas de un cliente
    Route::get('events-with-packages', [AppointmentController::class, 'getEventsWithPackages']); // Eventos con paquetes

    // Rutas de Admin (Usuarios y Gestión)
    Route::get('/employees/ratings', [EmployeeController::class, 'ratings']);
    Route::get('/admin/employees', [AdminUsersController::class, 'index']);
    Route::get('/admin/customers', [AdminUsersController::class, 'getCustomers']);
    Route::post('/admin/employees', [RegisterEmployeeController::class, 'store']);
    Route::patch('/admin/employees/{id}/availability', [AdminUsersController::class, 'toggleAvailability']);
    Route::patch('/admin/employees/{id}', [AdminUsersController::class, 'update']);
    Route::get('/admin/customers/count', [AdminUsersController::class, 'getCustomersCount']);

    // Rutas de Admin (Citas)
    Route::prefix('admin')->group(function () {
        Route::get('/appointments', [AdminAppointmentController::class, 'index']);
        Route::get('/appointments/unassigned', [AdminAppointmentController::class, 'unassigned']);
        Route::get('/employees/availability', [AdminAppointmentController::class, 'employeesAvailability']);
        Route::get('/appointments/{appointment}/candidates', [AdminAppointmentController::class, 'candidates']);
        Route::post('/appointments/{appointment}/assign', [AdminAppointmentController::class, 'assign']);
    });

    // Rutas de Admin (Datos Varios)
    Route::get('/admin/packages', [AdminPackagesController::class, 'index']);
    Route::get('/admin/document-types', [AdminDocumentTypesController::class, 'index']);
    Route::get('/admin/appointments/pending/{userId}', [AppointmentController::class, 'pendingByUserId']);
    Route::get('/admin/appointments/pending-count', [AppointmentController::class, 'getPendingCount']);

    // Rutas de Admin (Galería de Fotos)
    Route::get('/admin/cloud-photos/summary', [AdminPhotosController::class, 'summary']);

<<<<<<< HEAD
});
=======
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
Route::get('admin/payments/summary', [PaymentController::class, 'summary']);

Route::get('admin/storage-plans', [StoragePlanController::class, 'indexAdmin']);
Route::put('admin/storage-plans/{id}', [StoragePlanController::class, 'update']);
Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/booking-payments', [PaymentController::class, 'bookingPayments']);
    });

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/booking-payments', [PaymentController::class, 'bookingPayments']);
    });
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
>>>>>>> origin/luna
