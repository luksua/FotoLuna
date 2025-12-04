<?php

namespace App\Http\Controllers;
use Illuminate\Validation\Rule;

use App\Models\Booking;
use App\Models\User;
use App\Models\Customer;
use App\Models\Package;
use App\Models\StorageSubscription;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Employee;
use App\Models\BookingPhoto;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmedMail;
use Carbon\Carbon;
use App\Models\BookingPaymentInstallment;
use App\Notifications\BookingCreatedForCustomer;
use App\Notifications\BookingAssignedToEmployee;
use App\Notifications\BookingNeedsEmployeeAssignment;
use App\Notifications\PhotosReadyClient;
use App\Notifications\ReviewRequestClient;
use App\Notifications\BookingUpdatedClient;
use App\Notifications\BookingCancelledClient;
use App\Notifications\PhotographerAssignedClient;


class BookingController extends Controller
{
    public function summary(Booking $booking)
    {
        $booking->load([
            'appointment.customer',
            'appointment.photographer',
            'appointment.event',
            'package',
            'payments' => function ($q) {
                $q->orderByDesc('created_at');
            },
        ]);

        $appointment = $booking->appointment;

        $payment = $booking->payments->first(); // último pago

        return response()->json([
            'id' => $booking->bookingId,
            'date' => optional($appointment)->date,
            'time_start' => optional($appointment)->startTime ?? $appointment->time ?? null,
            'time_end' => optional($appointment)->endTime ?? null,
            'location' => optional($appointment)->place,
            'eventName' => optional($appointment->event)->eventName,
            'packageName' => optional($booking->package)->packageName,
            'photographerName' => optional($appointment->photographer)->name,
            'total' => optional($payment)->amount ?? 0,
            'paymentId' => optional($payment)->paymentId ?? null,
            'mpPaymentId' => optional($payment)->mp_payment_id ?? null,
        ]);
    }

    public function sendConfirmation(Booking $booking)
    {
        $booking->load([
            'appointment.customer',
            'appointment.event',
            'package',
            'documentType',
            'photographer',
            'payments' => fn($q) => $q->orderByDesc('paymentDate'),
        ]);

        // Cliente
        $customer = $booking->appointment?->customer;

        if (!$customer || !$customer->emailCustomer) {
            return response()->json([
                'message' => 'No se encontró el email del cliente.',
            ], 422);
        }

        // Plan de almacenamiento (si existe)
        $storageSubscription = StorageSubscription::where('bookingIdFK', $booking->bookingId)
            ->latest()
            ->first();

        // Último pago
        $lastPayment = $booking->payments->first();

        // Enviar correo
        Mail::to($customer->emailCustomer)->send(
            new BookingConfirmedMail(
                $booking,
                $storageSubscription,
                $lastPayment
            )
        );

        return response()->json([
            'message' => 'Correo de confirmación enviado.',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    // public function store(Request $request, $appointmentId)
    // {
    //     // Validar lo que pueda venir de ambos flujos
    //     $validated = $request->validate([
    //         'packageIdFK' => 'nullable|exists:packages,packageId',      // flujo paquetes
    //         'documentTypeId' => 'nullable|exists:document_types,id',       // flujo documentos
    //         'place' => 'nullable|string|max:255',                 // lugar para appointment
    //         'photo' => 'nullable|image|max:5120',                 // archivo para documentos
    //     ]);

    //     // Debe venir al menos paquete O documento
    //     if (empty($validated['packageIdFK']) && empty($validated['documentTypeId'])) {
    //         return response()->json([
    //             'message' => 'Debe enviar packageIdFK o documentTypeId',
    //         ], 422);
    //     }

    //     // Verifica que la cita exista
    //     $appointment = Appointment::findOrFail($appointmentId);

    //     // Si viene lugar, lo guardamos en appointments
    //     if (!empty($validated['place'])) {
    //         $appointment->update([
    //             'place' => $validated['place'],
    //         ]);
    //     }

    //     $booking = Booking::create([
    //         'appointmentIdFK' => $appointment->appointmentId,
    //         'packageIdFK' => $validated['packageIdFK'] ?? null,
    //         'documentTypeIdFK' => $validated['documentTypeId'] ?? null,
    //         'employeeIdFK' => null,
    //         'bookingStatus' => 'Pending',
    //     ]);

    //     if ($request->hasFile('photo')) {
    //         $path = $request->file('photo')->store('documents', 'public');

    //         BookingPhoto::create([
    //             'bookingIdFK' => $booking->bookingId,
    //             'photoPath' => $path,
    //             'photoDescription' => null,
    //             'employeeIdFK' => null,
    //         ]);
    //     }

    //     // Opcional: cambia el estado de la cita
    //     $appointment->update(['appointmentStatus' => 'Pending confirmation']);

    //     return response()->json([
    //         'message' => 'Reserva creada correctamente',
    //         'bookingId' => $booking->bookingId,
    //     ], 201);
    // }

    public function store(Request $request, $appointmentId)
    {
        // 1) Validar lo que pueda venir de ambos flujos
        $validated = $request->validate([
            'packageIdFK' => 'nullable|exists:packages,packageId',
            'documentTypeId' => 'nullable|exists:document_types,id',
            'employeeIdFK' => 'nullable|exists:employees,employeeId',
            'place' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:5120',
        ]);

        // Debe venir al menos uno de los dos
        if (empty($validated['packageIdFK']) && empty($validated['documentTypeId'])) {
            return response()->json([
                'message' => 'Debe enviar packageIdFK o documentTypeId',
            ], 422);
        }

        // 2) Buscar cita
        $appointment = Appointment::findOrFail($appointmentId);

        // 3) Guardar lugar en appointment si viene
        if (!empty($validated['place'])) {
            $appointment->place = $validated['place'];
        }

        // 4) Duración (por paquete si existe, si no, 60 min)
        $duration = 60;

        if (!empty($validated['packageIdFK'])) {
            $package = Package::findOrFail($validated['packageIdFK']);
            $duration = $package->durationMinutes ?? $duration;

            if ($appointment->appointmentTime) {
                $start = Carbon::createFromFormat('H:i:s', $appointment->appointmentTime);
                $end = $start->copy()->addMinutes($duration);

                $appointment->appointmentDuration = $duration;
                // si quieres guardar hora fin, podrías agregar un campo endTime…
            }
        }

        $appointment->save();

        // 5) Fotógrafo (opcional)
        $employee = null;
        $hasEmployee = !empty($validated['employeeIdFK']);

        if ($hasEmployee) {
            $employee = Employee::find($validated['employeeIdFK']);

            if (!$employee) {
                return response()->json(['message' => 'El fotógrafo no existe.'], 404);
            }
            if (!$employee->isAvailable) {
                return response()->json(['message' => 'Este fotógrafo no está disponible.'], 409);
            }
        }

        // 6) Status del booking
        $bookingStatus = $hasEmployee ? 'Confirmed' : 'Pending';

        // 7) Crear booking (para paquete O documento)
        $booking = Booking::create([
            'appointmentIdFK' => $appointment->appointmentId,
            'packageIdFK' => $validated['packageIdFK'] ?? null,
            'documentTypeIdFK' => $validated['documentTypeId'] ?? null,
            'employeeIdFK' => $hasEmployee ? $employee->employeeId : null,
            'bookingStatus' => $bookingStatus,
        ]);

        // Notificar a administradores si NO hay fotógrafo asignado
        if (!$hasEmployee) {
            $admins = User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                $admin->notify(
                    new BookingNeedsEmployeeAssignment($booking)
                );
            }
        }

        // 8) Foto opcional (documentos)
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('documents', 'public');

            BookingPhoto::create([
                'bookingIdFK' => $booking->bookingId,
                'photoPath' => $path,
                'photoDescription' => null,
                'employeeIdFK' => null,
            ]);
        }

        // 9) Actualizar estado de cita + disponibilidad del empleado
        if ($hasEmployee) {
            $appointment->update(['appointmentStatus' => 'Scheduled']);
            $employee->update(['isAvailable' => false]);

            // correo simple al fotógrafo (si quieres, puedes dejarlo / comentarlo)
            if (!empty($employee->emailEmployee)) {
                Mail::raw(
                    "Tienes una nueva sesión el {$appointment->appointmentDate} a las {$appointment->appointmentTime}.",
                    function ($message) use ($employee) {
                        $message->to($employee->emailEmployee)
                            ->subject('Nueva cita asignada');
                    }
                );
            }
        } else {
            $appointment->update(['appointmentStatus' => 'Pending confirmation']);
        }

        // 🔚 10) Respuesta SIEMPRE con bookingId
        return response()->json([
            'message' => 'Reserva creada correctamente',
            'bookingId' => $booking->bookingId,
            'status' => $booking->bookingStatus,
            'booking' => $booking->load(['appointment', 'package']),
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        // Cargar relaciones necesarias, incluyendo employee, pagos y cuotas
        $booking->load([
            'appointment.customer',
            'appointment.event',
            'package',
            'documentType',
            'employee',
            'payments' => function ($q) {
                $q->orderByDesc('paymentDate');
            },
            'installments', // 👈 relación de cuotas
        ]);

        $appointment = $booking->appointment;
        $event = $appointment?->event;
        $customer = $appointment?->customer;
        $package = $booking->package;
        $document = $booking->documentType;

        // ---------- TOTAL ----------
        // 1) Si hay cuotas, usamos la suma de las cuotas
        $totalFromInstallments = (float) $booking->installments->sum('amount');

        if ($totalFromInstallments > 0) {
            $total = $totalFromInstallments;
        } else {
            // 2) Si no hay cuotas, usamos paquete o documento (como tenías antes)
            $total = 0;
            if ($package) {
                $total = $package->price;
            } elseif ($document) {
                $total = $document->price;
            }
        }

        // ---------- ÚLTIMO PAGO ----------
        $lastPayment = $booking->payments->first();

        // ---------- ARMAR RESPUESTA ----------
        return response()->json([
            // OJO: tu frontend usa data.id, pero aquí tenías bookingId.
            // Puedes dejar ambos si quieres:
            'id' => $booking->bookingId,
            'bookingId' => $booking->bookingId,
            'bookingStatus' => $booking->bookingStatus,
            'total' => $total,

            'event' => $event ? [
                'id' => $event->eventId,
                'name' => $event->eventType,
                'category' => $event->category ?? null,
            ] : null,

            'package' => $package ? [
                'id' => $package->packageId,
                'name' => $package->packageName,
                'price' => $package->price,
            ] : null,

            'documentType' => $document ? [
                'id' => $document->id,
                'name' => $document->name,
                'price' => $document->price,
            ] : null,

            'appointment' => $appointment ? [
                'date' => $appointment->appointmentDate,
                'time' => $appointment->appointmentTime,
                'place' => $appointment->place,
            ] : null,

            'customer' => $customer ? [
                'id' => $customer->customerId,
                'name' => $customer->firstName . ' ' . $customer->lastName,
                'emailCustomer' => $customer->emailCustomer,
                'email' => $customer->emailCustomer,
            ] : null,

            'photographer' => $booking->employee ? [
                'name' => $booking->employee->firstNameEmployee . ' ' . $booking->employee->lastNameEmployee,
            ] : null,

            // 🔹 Esto es lo que tu AppointmentSummary espera:
            'last_payment' => $lastPayment ? [
                'status' => $lastPayment->paymentStatus,   // approved / pending / etc
                'mp_payment_id' => $lastPayment->mp_payment_id,
            ] : null,

            // 🔹 Array de cuotas para el resumen del último paso
            'installments' => $booking->installments->map(function ($ins) {
                return [
                    'id' => $ins->id,
                    'amount' => (float) $ins->amount,
                    'status' => $ins->status,     // "paid", "pending", "overdue", etc.
                    'due_date' => $ins->due_date,
                ];
            })->values(),
        ]);
    }


    // public function show(Booking $booking)
    // {
    //     // Cargar relaciones necesarias
    //     $booking->load([
    //         'appointment.customer',
    //         'appointment.event',
    //         'package',
    //         'documentType'
    //     ]);

    //     $appointment = $booking->appointment;
    //     $event = $appointment?->event;
    //     $customer = $appointment?->customer;
    //     $package = $booking->package;
    //     $document = $booking->documentType;

    //     // Calcular total
    //     $total = 0;
    //     if ($package) {
    //         $total = $package->price;
    //     } elseif ($document) {
    //         $total = $document->price;
    //     }

    //     return response()->json([
    //         'bookingId' => $booking->bookingId,
    //         'bookingStatus' => $booking->bookingStatus,

    //         'total' => $total,

    //         'event' => $event ? [
    //             'id' => $event->eventId,
    //             'name' => $event->eventType,
    //             'category' => $event->category ?? null,
    //         ] : null,

    //         'package' => $package ? [
    //             'id' => $package->packageId,
    //             'name' => $package->packageName,
    //             'price' => $package->price,
    //         ] : null,

    //         'documentType' => $document ? [
    //             'id' => $document->id,
    //             'name' => $document->name,
    //             'price' => $document->price,
    //         ] : null,

    //         'appointment' => $appointment ? [
    //             'date' => $appointment->appointmentDate,
    //             'time' => $appointment->appointmentTime,
    //             'place' => $appointment->place,
    //         ] : null,

    //         'customer' => $customer ? [
    //             'id' => $customer->customerId,
    //             'name' => $customer->firstName . ' ' . $customer->lastName,
    //             'email' => $customer->emailCustomer,
    //         ] : null,
    //     ]);
    // }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $bookingId)
    {
        $validated = $request->validate([
            'employeeIdFK' => 'nullable|exists:employees,employeeId',
            'bookingStatus' => 'nullable|string|in:Pending,Confirmed,Completed,Cancelled',
        ]);

        // 1) Cargamos booking con sus relaciones
        $booking = Booking::with(['appointment', 'package'])->findOrFail($bookingId);

        // Guardar valores anteriores para saber si cambian
        $oldEmployeeId = $booking->employeeIdFK;
        $oldStatus = $booking->bookingStatus;

        $appointment = $booking->appointment;
        $oldDate = optional($appointment)->appointmentDate;
        $oldTime = optional($appointment)->appointmentTime;
        $oldPlace = optional($appointment)->place;

        // 2) Asignar fotógrafo (si viene en el request)
        if (array_key_exists('employeeIdFK', $validated)) {
            $employeeId = $validated['employeeIdFK'];

            // Si mandas null = quitar/ninguno
            if (!is_null($employeeId)) {

                $appointment = $booking->appointment;
                $package = $booking->package;

                // Si no hay appointment, no podemos evaluar disponibilidad
                if (!$appointment) {
                    return response()->json([
                        'message' => 'No se encontró una cita asociada a esta reserva.',
                    ], 422);
                }

                $date = $appointment->appointmentDate;
                $time = $appointment->appointmentTime;

                // Manejo seguro de duración (paquete opcional)
                $duration = $package ? $package->durationMinutes : 60;

                // ¿Ese fotógrafo está disponible para ese rango?
                $isAvailable = Employee::availablePhotographers($date, $time, $duration)
                    ->where('employeeId', $employeeId)
                    ->exists();

                if (!$isAvailable) {
                    return response()->json([
                        'message' => 'Este fotógrafo no está disponible.',
                    ], 409);
                }

                // Asignamos el fotógrafo al booking
                $booking->employeeIdFK = $employeeId;
            } else {
                // Permitir quitar el fotógrafo
                $booking->employeeIdFK = null;
            }
        }

        // 3) Actualizar estado de la reserva si viene
        if (array_key_exists('bookingStatus', $validated)) {
            $booking->bookingStatus = $validated['bookingStatus'];
        }

        $booking->save();

        // -------- 4) NOTIFICACIONES DESPUÉS DE GUARDAR --------

        $appointment = $booking->appointment; // recargar referencia
        $customer = null;

        if ($appointment) {
            // Cliente desde el appointment (para reusar en Confirmed y Completed)
            $customer = Customer::with('user')->find($appointment->customerIdFK);
        }

        // 4.1. Notificar al empleado si se asignó uno nuevo
        if (!empty($booking->employeeIdFK) && $booking->employeeIdFK !== $oldEmployeeId) {

            $employee = Employee::with('user')->find($booking->employeeIdFK);

            if ($employee && $employee->user) {
                $employee->user->notify(
                    new BookingAssignedToEmployee($booking)
                );
            }
            // 4.1.b — Notificar al cliente que YA tiene fotógrafo
            $customer = Customer::with('user')->find($appointment->customerIdFK);

            if ($customer && $customer->user) {
                $customer->user->notify(
                    new PhotographerAssignedClient($booking)
                );
            }
        }

        // 4.2. Notificar al cliente si el status pasó a Confirmed
        if (
            isset($validated['bookingStatus']) &&
            $validated['bookingStatus'] === 'Confirmed' &&
            $oldStatus !== 'Confirmed' &&
            $customer && $customer->user
        ) {
            $customer->user->notify(
                new BookingCreatedForCustomer($booking, $appointment)
            );
        }

        // 4.3. Notificar al cliente si el status pasó a Completed (fotos listas)
        if (
            isset($validated['bookingStatus']) &&
            $validated['bookingStatus'] === 'Completed' &&
            $oldStatus !== 'Completed' &&
            $customer && $customer->user
        ) {
            $customer->user->notify(
                new PhotosReadyClient($booking)
            );
            // Reseña
            $customer->user->notify(
                new ReviewRequestClient($booking)
            );
        }

        // Si pasó de algo → Cancelled, avisar al cliente
        if (
            $oldStatus !== 'Cancelled' &&
            $booking->bookingStatus === 'Cancelled' &&
            $appointment
        ) {
            $customer = Customer::with('user')
                ->find($appointment->customerIdFK);

            if ($customer && $customer->user) {
                $customer->user->notify(
                    new BookingCancelledClient($booking, $appointment)
                );
            }
        }

        // ---- NOTI AL CLIENTE POR CAMBIO (horario/fotógrafo/lugar) ----
        if ($appointment) {
            $appointment->refresh(); // por si cambiaste algo de cita
            $customer = Customer::with('user')->find($appointment->customerIdFK);

            $cambioFecha = $appointment->appointmentDate !== $oldDate;
            $cambioHora = $appointment->appointmentTime !== $oldTime;
            $cambioLugar = $appointment->place !== $oldPlace;

            if ($customer && $customer->user && ($cambioFecha || $cambioHora || $cambioLugar)) {
                $customer->user->notify(
                    new BookingUpdatedClient($booking, $appointment)
                );
            }
        }

        // -------- FIN NOTIFICACIONES --------

        return response()->json([
            'message' => 'Fotógrafo asignado y cita actualizada con éxito.',
            'bookingId' => $booking->bookingId,
            'booking' => $booking->load(['appointment', 'employee', 'package']),
        ], 200);
    }


    // public function update(Request $request, $bookingId)
    // {
    //     $validated = $request->validate([
    //         'employeeIdFK' => 'nullable|exists:employees,employeeId',
    //         'bookingStatus' => 'nullable|string|in:Pending,Confirmed,Completed,Cancelled',
    //     ]);

    //     $booking = Booking::findOrFail($bookingId);

    //     if (isset($validated['employeeIdFK'])) {
    //         $employee = Employee::where('employeeId', $validated['employeeIdFK'])->first();

    //         if (!$employee) {
    //             return response()->json(['message' => 'El fotógrafo no existe.'], 404);
    //         }

    //         if (!$employee->isAvailable) {
    //             return response()->json(['message' => 'Este fotógrafo no está disponible.'], 409);
    //         }

    //         $booking->employeeIdFK = $employee->employeeId;
    //         $employee->update(['isAvailable' => false]);
    //     }

    //     if (isset($validated['bookingStatus'])) {
    //         $booking->bookingStatus = $validated['bookingStatus'];
    //     }

    //     $booking->save();

    //     return response()->json([
    //         'message' => 'Fotógrafo asignado y cita actualizada con éxito.',
    //         'booking' => $booking
    //     ], 200);
    // }

    /**
     * Remove the specified resource from storage.
     */

    // empleado
    // public function employeeAppointments($employeeId)
    // {
    //     $user = Auth::user();

    //     if (!$user) {
    //         return response()->json(['message' => 'No autenticado'], 401);
    //     }

    //     // Si es empleado, solo puede ver SUS citas
    //     if ($user->role === 'empleado') {
    //         $authEmployee = $user->employee;
    //         if (
    //             !$authEmployee ||
    //             (int) $authEmployee->employeeId !== (int) $employeeId
    //         ) {
    //             return response()->json(['message' => 'No autorizado'], 403);
    //         }
    //     }

    //     // Admin puede ver cualquier empleado; cliente no debería entrar aquí

    //     $bookings = Booking::with([
    //         'appointment.customer',
    //         'appointment.event',
    //         'package',
    //     ])
    //         ->where('employeeIdFK', $employeeId)
    //         // 👀 OJO: NO filtramos por estado para que vengan también las canceladas
    //         ->orderBy('bookingId', 'asc')
    //         ->get();

    //     $mapped = $bookings->map(function (Booking $b) {
    //         $appointment = $b->appointment;
    //         $customer = $appointment?->customer;
    //         $event = $appointment?->event;
    //         $package = $b->package;

    //         $statusBackend = $appointment?->appointmentStatus ?? $b->bookingStatus;
    //         $statusFront = match (strtolower((string) $statusBackend)) {
    //             'cancelled' => 'Cancelada',
    //             'completed' => 'Completada',
    //             'scheduled', 'confirmado', 'confirmed' => 'Confirmada',
    //             'pending confirmation', 'pendiente' => 'Pendiente',
    //             default => 'Pendiente',
    //         };

    //         return [
    //             'bookingId' => $b->bookingId,
    //             'appointmentId' => $appointment?->appointmentId,
    //             'date' => $appointment?->appointmentDate,     // "YYYY-MM-DD"
    //             'startTime' => $appointment?->appointmentTime,     // "HH:MM:SS"
    //             'endTime' => null,
    //             'place' => $appointment?->place,
    //             'comment' => $appointment?->comment,
    //             'status' => $statusFront,

    //             'clientName' => trim(($customer->firstNameCustomer ?? '') . ' ' . ($customer->lastNameCustomer ?? '')),
    //             'clientDocument' => $customer->documentNumber ?? null,
    //             'clientEmail' => $customer->emailCustomer ?? null,
    //             'clientPhone' => $customer->phoneCustomer ?? null,

    //             'eventName' => $event?->eventName ?? null,
    //             'packageName' => $package?->packageName ?? null,
    //         ];
    //     });

    //     return response()->json($mapped);
    // }
    public function destroy(Booking $booking)
    {
        //
    }
    public function updateByEmployee(Request $request, $appointmentId)
    {
        // 1. INICIALIZACIÓN Y SEGURIDAD
        $user = $request->user();

        // Verificar que el usuario tenga empleado asociado
        if (!$user || !$user->employee) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un empleado asociado'
            ], 403);
        }

        $employee = $user->employee;
        $employeeId = $employee->employeeId;
        $appointment = Appointment::findOrFail($appointmentId);

        // 2. BUSCAR BOOKING ASIGNADO (Si existe)
        // Se busca un booking donde el empleado logueado esté asignado.
        $booking = Booking::where('appointmentIdFK', $appointment->appointmentId)
            ->where('employeeIdFK', $employeeId)
            ->first();

        $bookingExists = !is_null($booking);

        // Verificar si el empleado es el creador de la cita (usando la nueva columna employeeIdFK en appointments)
        $isCreator = $appointment->employeeIdFK === $employeeId;

        // 3. VERIFICACIÓN DE PERMISOS
        if (!$bookingExists && !$isCreator) {
            // Rechazar si no es el creador Y no está asignado por booking
            return response()->json([
                'message' => 'Esta cita no está asignada a este empleado ni fue creada por él.'
            ], 403);
        }

        // 4. VALIDACIÓN DE LOS DATOS DE ENTRADA
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'startTime' => ['required', 'date_format:H:i'],
            'place' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:500'],
            'status' => [
                'required',
                'string',
                Rule::in([
                    'Pending confirmation', // pendiente
                    'Scheduled',            // confirmada
                    'Cancelled',
                    'Completed',
                ]),
            ],
        ]);

        // 5. ACTUALIZAR APPOINTMENT
        $appointment->update([
            'appointmentDate' => $data['date'],
            'appointmentTime' => $data['startTime'],
            'place' => $data['place'] ?? $appointment->place,
            'comment' => $data['comment'] ?? $appointment->comment,
            'appointmentStatus' => $data['status'], // Estado principal de la cita
        ]);

        // 6. ACTUALIZAR BOOKING (SOLO SI EXISTE)
        if ($booking) {
            // Mapeo: texto de la API → ENUM de la tabla bookings
            // Usamos el match de PHP para el mapeo de estados, asegurando el default.
            $bookingStatus = match ($data['status']) {
                'Pending confirmation' => 'Pending',
                'Scheduled' => 'Confirmed',
                'Cancelled' => 'Cancelled',
                'Completed' => 'Completed',
                default => 'Pending', // Fallback si llega un estado inesperado
            };

            $booking->update([
                'bookingStatus' => $bookingStatus,
            ]);
        }

        // 7. RESPUESTA FINAL
        return response()->json([
            'message' => 'Cita actualizada correctamente',
            'appointment' => $appointment->fresh(),
            // Incluir booking si se actualizó
            'booking' => $booking ? $booking->fresh() : null,
        ], 200);
    }
}
