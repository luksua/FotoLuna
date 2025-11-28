<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\StorageSubscription;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Employee;
use App\Models\BookingPhoto;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmedMail;
use Carbon\Carbon;
use App\Models\BookingPaymentInstallment;

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
            'place' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:5120'
        ]);

        if (empty($validated['packageIdFK']) && empty($validated['documentTypeId'])) {
            return response()->json([
                'message' => 'Debe enviar packageIdFK o documentTypeId',
            ], 422);
        }

        // 2) Buscar cita
        $appointment = Appointment::findOrFail($appointmentId);

        // 3) Guardar lugar en appointment si viene
        if (!empty($validated['place'])) {
            $appointment->update(['place' => $validated['place']]);
        }

        // 4) Si el cliente eligió empleado
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

        // 5) Status del booking
        $bookingStatus = $hasEmployee ? 'Confirmed' : 'Pending';

        // 6) Crear booking
        $booking = Booking::create([
            'appointmentIdFK' => $appointment->appointmentId,
            'packageIdFK' => $validated['packageIdFK'] ?? null,
            'documentTypeIdFK' => $validated['documentTypeId'] ?? null,
            'employeeIdFK' => $hasEmployee ? $employee->employeeId : null,
            'bookingStatus' => $bookingStatus,
        ]);

        // 7) Foto opcional
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('documents', 'public');

            BookingPhoto::create([
                'bookingIdFK' => $booking->bookingId,
                'photoPath' => $path,
                'photoDescription' => null,
                'employeeIdFK' => null,
            ]);
        }

        // 8) Actualizar estado de cita + disponibilidad empleado
        if ($hasEmployee) {
            $appointment->update(['appointmentStatus' => 'Scheduled']);
            $employee->update(['isAvailable' => false]);

            // 9) Notificación por correo (mínima)
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

        return response()->json([
            'message' => 'Reserva creada correctamente',
            'bookingId' => $booking->bookingId,
            'status' => $booking->bookingStatus,
        ], 201);

    }


    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        // Cargar relaciones necesarias
        $booking->load([
            'appointment.customer',
            'appointment.event',
            'package',
            'documentType'
        ]);

        $appointment = $booking->appointment;
        $event = $appointment?->event;
        $customer = $appointment?->customer;
        $package = $booking->package;
        $document = $booking->documentType;

        // Calcular total
        $total = 0;
        if ($package) {
            $total = $package->price;
        } elseif ($document) {
            $total = $document->price;
        }

        return response()->json([
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
                'email' => $customer->emailCustomer,
            ] : null,
        ]);
    }


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

        // Cargamos booking con cita y paquete
        $booking = Booking::with(['appointment', 'package'])->findOrFail($bookingId);

        // Asignar fotógrafo (si viene)
        if (array_key_exists('employeeIdFK', $validated)) {
            $employeeId = $validated['employeeIdFK'];

            // Si el usuario elige "sin preferencia" y mandas null,
            // puedes simplemente no asignar nada y saltarte la validación:
            if (!is_null($employeeId)) {

                // Datos de la cita y duración desde el booking
                $appointment = $booking->appointment;
                $package = $booking->package;

                $date = $appointment->appointmentDate;   // ajusta a tus columnas reales
                $time = $appointment->appointmentTime;
                $duration = $package->durationMinutes ?? 60;

                // ¿Ese fotógrafo está disponible para ese rango?
                $isAvailable = Employee::availablePhotographers($date, $time, $duration)
                    ->where('employeeId', $employeeId)
                    ->exists();

                if (!$isAvailable) {
                    return response()->json([
                        'message' => 'Este fotógrafo no está disponible.'
                    ], 409);
                }

                // Si sí está disponible, lo asignamos al booking
                $booking->employeeIdFK = $employeeId;
            }
        }

        // Actualizar estado de la reserva si viene
        if (array_key_exists('bookingStatus', $validated)) {
            $booking->bookingStatus = $validated['bookingStatus'];
        }

        $booking->save();

        return response()->json([
            'message' => 'Fotógrafo asignado y cita actualizada con éxito.',
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
}
