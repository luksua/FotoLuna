<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\BookingPaymentInstallment;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Throwable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\Booking;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index(Request $request): JsonResponse
    // {
    //     $user = $request->user();
    //     if (!$user) {
    //         return response()->json(['message' => 'No autenticado.'], 401);
    //     }

    //     // buscar el customer asociado al user (customers.user_id)
    //     $customer = Customer::where('user_id', $user->id)->first();

    //     if (!$customer) {
    //         // Devolvemos un paginador "vacío" simple para no romper el frontend
    //         return response()->json([
    //             'data' => [],
    //             'current_page' => 1,
    //             'from' => null,
    //             'last_page' => 1,
    //             'per_page' => (int) $request->query('per_page', 10),
    //             'to' => null,
    //             'total' => 0,
    //         ], 200);
    //     }

    //     $perPage = (int) $request->query('per_page', 10);
    //     $perPage = max(1, min(100, $perPage));

    //     try {
    //         // Query: cargar bookings -> package, documentType, payments
    //         // IMPORTANTE: ajusta los nombres de relación si tus modelos se llaman distinto.
    //         $query = Appointment::query()
    //             ->with([
    //                 // Relación con event si la tienes (events.eventType)
    //                 'event', // opcional: carga evento (asegúrate de tener la relación event() en Appointment)
    //                 // bookings debe ser la relación en Appointment hacia Bookings
    //                 'bookings.package',       // booking->package (packages table)
    //                 'bookings.documentType',  // booking->documentType (document_types table)
    //                 'bookings.payments',      // booking->payments (payments table)
    //             ])
    //             ->where('customerIdFK', $customer->customerId)
    //             ->orderBy('appointmentDate', 'desc')
    //             ->orderBy('appointmentTime', 'desc');

    //         $paginator = $query->paginate($perPage)->appends($request->query());

    //         // Transformar colección
    //         $transformed = $paginator->getCollection()->transform(function ($a) {
    //             // Construir datetime ISO a partir de appointmentDate + appointmentTime
    //             $datetime = null;
    //             try {
    //                 $date = $a->appointmentDate ?? null;
    //                 $time = $a->appointmentTime ?? null;
    //                 if ($date) {
    //                     if ($time) {
    //                         $datetime = Carbon::parse("{$date} {$time}")->toIso8601String();
    //                     } else {
    //                         $datetime = Carbon::parse($date)->toIso8601String();
    //                     }
    //                 }
    //             } catch (\Exception $e) {
    //                 $datetime = ($a->appointmentDate ?? null);
    //             }

    //             // Document types únicos tomados desde bookings.documentType
    //             $documentTypes = collect($a->bookings ?? [])
    //                 ->map(function ($b) {
    //                     return $b->documentType ? [
    //                         'id' => $b->documentType->id,
    //                         'name' => $b->documentType->name,
    //                         'slug' => $b->documentType->slug ?? null,
    //                     ] : null;
    //                 })
    //                 ->filter()
    //                 ->unique('id')
    //                 ->values()
    //                 ->all();

    //             // Bookings transformadas (cada booking con package, payments y resumen)
    //             $bookings = collect($a->bookings ?? [])->map(function ($b) {
    //                 $package = $b->package ? [
    //                     'id' => $b->package->packageId ?? null,
    //                     'name' => $b->package->packageName ?? null,
    //                     'price' => isset($b->package->price) ? (float) $b->package->price : null,
    //                 ] : null;

    //                 $payments = collect($b->payments ?? [])->map(function ($p) {
    //                     return [
    //                         'id' => $p->paymentId ?? null,
    //                         'amount' => isset($p->amount) ? (float) $p->amount : null,
    //                         'paymentDate' => isset($p->paymentDate) ? Carbon::parse($p->paymentDate)->toIso8601String() : null,
    //                         'method' => $p->paymentMethod ?? null,
    //                         'installments' => $p->installments ?? null,
    //                         'mp_payment_id' => $p->mp_payment_id ?? null,
    //                         'card_last_four' => $p->card_last_four ?? null,
    //                         'status' => $p->paymentStatus ?? null,
    //                     ];
    //                 })->values()->all();

    //                 // total pagado para este booking (sum de payments.amount con estado approved/in_process)
    //                 $totalPaid = collect($b->payments ?? [])->reduce(function ($carry, $p) {
    //                     // considerar como pagos válidos los approved / in_process (ajusta según tu lógica)
    //                     if (in_array(strtolower($p->paymentStatus ?? ''), ['approved', 'in_process'])) {
    //                         return $carry + (float) $p->amount;
    //                     }
    //                     return $carry;
    //                 }, 0.0);

    //                 // deuda aproximada: si existe package.price, usamos como total a pagar
    //                 $totalDue = isset($b->package->price) ? (float) $b->package->price : null;
    //                 $remaining = is_null($totalDue) ? null : max(0, $totalDue - $totalPaid);

    //                 // Estado de pago resumido para este booking
    //                 $payment_status = 'pendiente';
    //                 if ($totalDue !== null) {
    //                     if ($totalPaid >= $totalDue && $totalDue > 0) {
    //                         $payment_status = 'pagado';
    //                     } elseif ($totalPaid > 0) {
    //                         $payment_status = 'parcial';
    //                     } else {
    //                         $payment_status = 'pendiente';
    //                     }
    //                 } else {
    //                     // si no hay totalDue, inferir por pagos
    //                     $payment_status = (count($payments) === 0) ? 'pendiente' : 'registrado';
    //                 }

    //                 return [
    //                     'id' => $b->bookingId ?? null,
    //                     'package' => $package,
    //                     'document_type' => $b->documentType ? [
    //                         'id' => $b->documentType->id,
    //                         'name' => $b->documentType->name,
    //                     ] : null,
    //                     'payments' => $payments,
    //                     'total_paid' => $totalPaid,
    //                     'total_due' => $totalDue,
    //                     'remaining' => $remaining,
    //                     'payment_status' => $payment_status,
    //                     'bookingStatus' => $b->bookingStatus ?? null,
    //                 ];
    //             })->values()->all();

    //             // Agregar estado de pago a nivel de appointment (si al menos una booking está pendiente -> pendiente, si todas pagadas -> pagado)
    //             $appointmentPaymentStatus = 'pendiente';
    //             if (count($bookings) === 0) {
    //                 $appointmentPaymentStatus = 'sin_info';
    //             } else {
    //                 $allPaid = collect($bookings)->every(function ($bb) {
    //                     return $bb['payment_status'] === 'pagado';
    //                 });
    //                 $anyPaid = collect($bookings)->some(function ($bb) {
    //                     return in_array($bb['payment_status'], ['parcial', 'pagado', 'registrado']);
    //                 });
    //                 if ($allPaid) $appointmentPaymentStatus = 'pagado';
    //                 elseif ($anyPaid) $appointmentPaymentStatus = 'parcial';
    //                 else $appointmentPaymentStatus = 'pendiente';
    //             }

    //             return [
    //                 'id' => $a->appointmentId ?? null,
    //                 'event_type' => $a->event ? ($a->event->eventType ?? null) : ($a->eventIdFK ?? null),
    //                 'datetime' => $datetime,
    //                 'date' => $a->appointmentDate ?? null,
    //                 'time' => $a->appointmentTime ?? null,
    //                 'place' => $a->place ?? null,
    //                 'reservation_status' => $a->appointmentStatus ?? null,
    //                 'payment_status' => $appointmentPaymentStatus,
    //                 'document_types' => $documentTypes,
    //                 'bookings' => $bookings,
    //             ];
    //         });

    //         $paginator->setCollection($transformed);

    //         return response()->json($paginator, 200);
    //     } catch (Throwable $e) {
    //         \Log::error('AppointmentController@index error: '.$e->getMessage());
    //         return response()->json(['message' => 'Error al listar citas', 'error' => $e->getMessage()], 500);
    //     }
    // }

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->customer) {
            return response()->json(['data' => []]);
        }

        $customerId = $user->customer->customerId;

        $appointments = Appointment::with([
            'event',
            'booking.package',
            'booking.documentType',
            'booking.installments'
        ])
            ->where('customerIdFK', $customerId)
            ->orderByDesc('appointmentDate')
            ->orderByDesc('appointmentTime')
            ->get();

        $data = $appointments->map(function ($a) {

            $booking = $a->booking;

            if (!$booking) {
                return [
                    'id' => $a->appointmentId,
                    'event_type' => $a->event?->eventType,
                    'datetime' => $a->appointmentDate . ' ' . $a->appointmentTime,
                    'place' => $a->place,
                    'reservation_status' => $a->appointmentStatus,
                    'payment_status' => 'Sin información',
                    'document_types' => [],
                    'payment' => null,
                ];
            }

            /** --------------------
             *  DOCUMENTOS
             * --------------------*/
            $documentTypes = [];
            if ($booking->documentType) {
                $documentTypes[] = [
                    'id' => $booking->documentType->id,
                    'name' => $booking->documentType->name,
                    'url' => $booking->documentType->url ?? null
                ];
            }

            /** --------------------
             *  CUOTAS / PAGOS
             * --------------------*/
            $installments = $booking->installments;

            $total = $installments->sum('amount');
            $paid = $installments->where('status', 'paid')->sum('amount');
            $pending = max(0, $total - $paid);

            /** estado del pago */
            if ($pending == 0 && $total > 0) {
                $paymentStatus = 'Pagado';
            } elseif ($paid > 0) {
                $paymentStatus = 'En cuotas';
            } else {
                $paymentStatus = 'Pendiente';
            }

            return [
                'id' => $a->appointmentId,
                'event_type' => $a->event?->eventType ?? '—',
                'datetime' => Carbon::parse($a->appointmentDate . ' ' . $a->appointmentTime)->toIso8601String(),
                'place' => $a->place,
                'reservation_status' => $a->appointmentStatus,
                'payment_status' => $paymentStatus,
                'document_types' => $documentTypes,

                'payment' => $installments->isEmpty() ? null : [
                    'total' => $total,
                    'paid' => $paid,
                    'installments' => $installments->map(function ($ins) {
                        return [
                            'id' => $ins->id,
                            'amount' => (float) $ins->amount,
                            'due_date' => $ins->due_date ? Carbon::parse($ins->due_date)->toIso8601String() : null,
                            'paid' => $ins->status === 'paid',
                            'paid_at' => $ins->paid_at ? Carbon::parse($ins->paid_at)->toIso8601String() : null,
                            'receipt_path' => $ins->receipt_path,
                            'is_overdue' => !$ins->paid && $ins->due_date && Carbon::parse($ins->due_date)->isPast(),
                        ];
                    })
                ]
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function downloadReceipt(Appointment $appointment, BookingPaymentInstallment $installment)
    {
        // Seguridad: asegurar que la cuota pertenece a esa cita y al cliente logueado
        if ($installment->booking->appointmentIdFK !== $appointment->appointmentId) {
            abort(403);
        }

        if (!$installment->receipt_path || !Storage::exists($installment->receipt_path)) {
            abort(404, 'Recibo no disponible');
        }

        return Storage::download($installment->receipt_path);
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
    public function store(Request $request)
    {
        try {
            \Log::info('Datos recibidos en store appointment:', $request->all());

            // ✅ Validar entrada
            $validator = Validator::make($request->all(), [
                'eventIdFK' => 'required|exists:events,eventId',
                'appointmentDate' => 'required|date|after_or_equal:today',
                'appointmentTime' => 'required|string',
                'place' => 'nullable|string|max:100',
                'comment' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // ✅ Obtener el cliente del usuario autenticado
            $user = auth()->user();

            if (!$user || !$user->customer) {
                return response()->json([
                    'message' => 'El usuario autenticado no tiene un cliente asociado'
                ], 403);
            }

            $customerId = $user->customer->customerId;

            $employeeId = $request->employeeIdFK ?? null;



            // ✅ Crear la cita
            $appointment = Appointment::create([
                'customerIdFK' => $customerId,
                'eventIdFK' => $request->eventIdFK,
                'appointmentDate' => $request->appointmentDate,
                'appointmentTime' => $request->appointmentTime,
                'appointmentTimeEnd' => $request->appointmentTimeEnd ?? null,
                'place' => $request->place ?? null,
                'comment' => $request->comment,
            ]);

            // ✅ Respuesta JSON limpia
            return response()->json([
                'message' => 'Cita creada correctamente',
                'appointmentId' => $appointment->appointmentId,
                'status' => $appointment->appointmentStatus,
            ], 201);
        } catch (Throwable $e) {
            \Log::error('Error al crear cita: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // public function getAvailability(Request $request)
    // {
    //     $request->validate([
    //         'date' => 'required|date',
    //     ]);

    //     $baseSlots = [
    //         '08:00:00',
    //         '09:00:00',
    //         '10:00:00',
    //         '11:00:00',
    //         '12:00:00',
    //         '14:00:00',
    //         '15:00:00',
    //         '16:00:00',
    //         '17:00:00',
    //         '18:00:00',
    //     ];

    //     $date = $request->date;
    //     $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek; // 0=Domingo, 6=Sábado

    //     // Si es domingo, limita horarios
    //     if ($dayOfWeek === 0) {
    //         $baseSlots = ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00']; // menos horas
    //     }

    //     // Si el día ya pasó, todo bloqueado
    //     if (\Carbon\Carbon::parse($date)->isBefore(\Carbon\Carbon::today())) {
    //         return response()->json(['available' => [], 'allBlocked' => true]);
    //     }


    //     // Obtén las citas existentes para ese día
    //     $appointments = Appointment::whereDate('appointmentDate', $date)
    //         ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
    //         ->pluck('appointmentTime')
    //         ->toArray();

    //     // Calcula los horarios disponibles
    //     $availableSlots = array_values(array_diff($baseSlots, $appointments));

    //     $allBlocked = count($availableSlots) === 0;

    //     return response()->json([
    //         'available' => $availableSlots,
    //         'blocked' => $appointments,
    //         'allBlocked' => $allBlocked,
    //     ]);
    // }

    // public function getMonthlyAvailability(Request $request)
    // {
    //     $month = $request->query('month', now()->month);
    //     $year = $request->query('year', now()->year);

    //     $days = [];
    //     $baseSlots = [
    //         '09:00:00',
    //         '09:30:00',
    //         '10:00:00',
    //         '10:30:00',
    //         '11:00:00',
    //         '11:30:00',
    //         '12:00:00',
    //         '14:00:00',
    //         '14:30:00',
    //         '15:00:00',
    //         '15:30:00',
    //         '16:00:00',
    //         '16:30:00',
    //         '17:00:00',
    //     ];

    //     $appointments = Appointment::whereMonth('appointmentDate', $month)
    //         ->whereYear('appointmentDate', $year)
    //         ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
    //         ->get(['appointmentDate', 'appointmentTime']);

    //     $grouped = $appointments->groupBy(fn($a) => $a->appointmentDate->format('Y-m-d'));

    //     foreach ($grouped as $date => $slots) {
    //         $taken = $slots->pluck('appointmentTime')->toArray();
    //         $available = array_diff($baseSlots, $taken);
    //         $days[$date] = [
    //             'allBlocked' => count($available) === 0,
    //         ];
    //     }

    //     return response()->json($days);
    // }

    public function availability(Request $request)
    {
        $baseSlots = [
            '08:00:00',
            '09:00:00',
            '10:00:00',
            '11:00:00',
            '12:00:00',
            '13:00:00',
            '14:00:00',
            '15:00:00',
            '16:00:00',
            '17:00:00',
            '18:00:00',
            '19:00:00',
        ];

        $date = $request->query('date');
        $month = $request->query('month');
        $year = $request->query('year', now()->year);

        // Si piden disponibilidad de un día específico:
        if ($date) {
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;

            // Bloquear domingos o días pasados
            if (Carbon::parse($date)->isBefore(Carbon::today())) {
                return response()->json([
                    'available' => [],
                    'blocked' => [],
                    'allBlocked' => true,
                ]);
            }

            // Limitar horarios los domingos (opcional)
            if ($dayOfWeek === 0) {
                $baseSlots = ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00'];
            }

            $appointments = Appointment::whereDate('appointmentDate', $date)
                ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
                ->pluck('appointmentTime')
                ->toArray();

            $available = array_values(array_diff($baseSlots, $appointments));
            $allBlocked = count($available) === 0;

            return response()->json([
                'available' => $available,
                'blocked' => $appointments,
                'allBlocked' => $allBlocked,
            ]);
        }

        // Si piden disponibilidad mensual (month + year)
        if ($month) {
            $appointments = Appointment::whereMonth('appointmentDate', $month)
                ->whereYear('appointmentDate', $year)
                ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
                ->get(['appointmentDate', 'appointmentTime']);

            $grouped = $appointments->groupBy(function ($a) {
                return Carbon::parse($a->appointmentDate)->format('Y-m-d');
            });

            $days = [];
            foreach ($grouped as $d => $slots) {
                $taken = $slots->pluck('appointmentTime')->toArray();
                $available = array_diff($baseSlots, $taken);
                $days[$d] = ['allBlocked' => count($available) === 0];
            }

            return response()->json($days);
        }

        // Si no se pasó parámetro, error
        return response()->json(['message' => 'Debe proporcionar date o month'], 400);
    }



    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'packageId' => 'nullable|exists:packages,id',
            'appointmentStatus' => 'required|string',
            'place' => $request->place ?? $appointment->place,
        ]);

        $appointment->update($validated);

        return response()->json([
            'message' => 'Cita actualizada correctamente',
            'appointment' => $appointment,
        ]);
    }
    //    empleado

    public function employeeAppointments($employeeId)
    {
        // Traemos el booking + appointment + customer + event + package
        $bookings = Booking::with([
            'appointment.customer',
            'appointment.event',
            'package',
        ])
            ->where('employeeIdFK', $employeeId)
            ->where('bookingStatus', 'Confirmed')
            ->get();

        $result = $bookings->map(function ($b) {
            $a = $b->appointment;
            $customer = $a?->customer;
            $event = $a?->event;
            $package = $b->package;

            return [
                'bookingId' => $b->bookingId,
                'appointmentId' => $b->appointmentIdFK,
                'date' => optional($a->appointmentDate)->format('Y-m-d'),
                'startTime' => $a->appointmentTime,
                'endTime' => null,
                'place' => $a->place,
                'comment' => $a->comment,
                'status' => $b->bookingStatus,

                // 👇 datos del cliente
                'clientName' => $customer
                    ? trim($customer->firstNameCustomer . ' ' . $customer->lastNameCustomer)
                    : null,
                'clientDocument' => $customer
                    ? trim(($customer->documentType ?? '') . ' ' . ($customer->documentNumber ?? ''))
                    : null,
                'clientEmail' => $customer->emailCustomer ?? null,
                'clientPhone' => $customer->phoneCustomer ?? null,

                // 👇 evento y paquete
                'eventName' => $event->eventName ?? null,
                'packageName' => $package->packageName ?? null,
            ];
        });

        return response()->json($result->values());
    }
    // Actualización de cita por EMPLEADO/FOTÓGRAFO
    public function updateByEmployee(Request $request, $appointmentId)
    {
        $user = $request->user();

        // 1) Asegurarnos de que sea empleado
        if (!$user || $user->role !== 'empleado') {
            return response()->json([
                'message' => 'Solo los empleados pueden editar sus citas',
            ], 403);
        }

        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un empleado asociado',
            ], 403);
        }

        // 2) Buscar el booking que une a este empleado con esta cita
        $booking = Booking::with('appointment')
            ->where('employeeIdFK', $employee->employeeId)
            ->where('appointmentIdFK', $appointmentId)
            ->first();

        if (!$booking) {
            // O 404 si prefieres "no encontrada"
            return response()->json([
                'message' => 'No tienes permisos para editar esta cita',
            ], 403);
        }

        $appointment = $booking->appointment;

        if (!$appointment) {
            return response()->json([
                'message' => 'La cita asociada al booking no existe',
            ], 404);
        }

        // 3) Validar SOLO los campos que puede cambiar el empleado
        $validated = $request->validate([
            'appointmentDate' => 'sometimes|date|after_or_equal:today',
            'appointmentTime' => 'sometimes|string', // puedes afinar formato HH:MM
            'place' => 'sometimes|nullable|string|max:100',
            'comment' => 'sometimes|nullable|string|max:255',
            'appointmentStatus' => 'sometimes|in:Pending confirmation,Scheduled,Completed,Cancelled',
        ]);

        // 4) Aplicar cambios a la cita
        $appointment->fill($validated);
        $appointment->save();

        // 5) Sincronizar estado del booking si se envió appointmentStatus
        if (array_key_exists('appointmentStatus', $validated)) {
            switch ($validated['appointmentStatus']) {
                case 'Cancelled':
                    $booking->bookingStatus = 'Cancelled';
                    break;

                case 'Scheduled':
                case 'Completed':
                    $booking->bookingStatus = 'Confirmed';
                    break;

                case 'Pending confirmation':
                default:
                    $booking->bookingStatus = 'Pending';
                    break;
            }

            $booking->save();
        }

        return response()->json([
            'message' => 'Cita actualizada correctamente',
            'appointment' => $appointment,
            'booking' => $booking,
        ]);
    }





    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        //
    }

}
