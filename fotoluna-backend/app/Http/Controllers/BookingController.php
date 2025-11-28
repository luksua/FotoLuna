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
        $validated = $request->validate([
            'packageIdFK' => 'nullable|exists:packages,packageId',   // flujo paquetes
            'documentTypeId' => 'nullable|exists:document_types,id',    // flujo documentos
            'place' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:5120',
        ]);

        if (empty($validated['packageIdFK']) && empty($validated['documentTypeId'])) {
            return response()->json([
                'message' => 'Debe enviar packageIdFK o documentTypeId',
            ], 422);
        }

        $appointment = Appointment::findOrFail($appointmentId);

        if (!empty($validated['place'])) {
            $appointment->update([
                'place' => $validated['place'],
            ]);
        }

        $booking = Booking::create([
            'appointmentIdFK' => $appointment->appointmentId,
            'packageIdFK' => $validated['packageIdFK'] ?? null,
            'documentTypeIdFK' => $validated['documentTypeId'] ?? null,
            'employeeIdFK' => null,
            'bookingStatus' => 'Pending',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('documents', 'public');

            BookingPhoto::create([
                'bookingIdFK' => $booking->bookingId,
                'photoPath' => $path,
                'photoDescription' => null,
                'employeeIdFK' => null,
            ]);
        }

        $appointment->update(['appointmentStatus' => 'Pending confirmation']);

        return response()->json([
            'message' => 'Reserva creada correctamente',
            'bookingId' => $booking->bookingId,
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
    public function destroy(Booking $booking)
    {
        //
    }
}
