<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\BookingPaymentInstallment;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Throwable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use App\Models\Booking;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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
            // Para mantener la forma, devolvemos un paginador vacío
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 8,
                'total' => 0,
            ]);
        }

        $customerId = $user->customer->customerId;

        // 🔹 AHORA CON PAGINACIÓN (8 por página)
        $appointments = Appointment::with([
            'event',
            'booking.package',
            'booking.documentType',
            'booking.installments',   // cuotas
        ])
            ->where('customerIdFK', $customerId)
            ->orderByDesc('appointmentDate')
            ->orderByDesc('appointmentTime')
            ->paginate(8); // 👈 aquí está la magia

        // Mapear SOLO la colección interna
        $mapped = $appointments->getCollection()->map(function ($a) {
            $booking = $a->booking;

            // ---------------------------
            //  SIN BOOKING ASOCIADO
            // ---------------------------
            if (!$booking) {
                return [
                    'id' => $a->appointmentId,
                    'booking_id' => null,          // no hay booking
                    'package' => null,

                    'event_type' => $a->event?->eventType,
                    'datetime' => Carbon::parse(
                        ($a->appointmentDate ?? '') . ' ' . ($a->appointmentTime ?? '')
                    )->toIso8601String(),
                    'place' => $a->place,

                    'reservation_status' => $a->appointmentStatus ?? 'Sin estado',
                    'payment_status' => 'Sin información',
                    'document_types' => [],
                    'appointment_status' => $a->appointmentStatus,
                    'payment' => null,
                ];
            }

            // ---------------------------
            //  DOCUMENTOS
            // ---------------------------
            $documentTypes = [];
            if ($booking->documentType) {
                $documentTypes[] = [
                    'id' => $booking->documentType->id,
                    'name' => $booking->documentType->name,
                    'url' => $booking->documentType->url ?? null,
                ];
            }

            // ---------------------------
            //  CUOTAS / PAGOS
            // ---------------------------
            $installments = $booking->installments ?? collect();

            $total = (float) $installments->sum('amount');
            $paid = (float) $installments->where('status', 'paid')->sum('amount');
            $pendingAmount = max(0, $total - $paid);

            $paidCount = $installments->where('status', 'paid')->count();
            $pendingCount = $installments->where('status', 'pending')->count();
            $overdueCount = $installments->where('status', 'overdue')->count();

            // Estado de pago (usando SOLO las cuotas)
            if ($installments->isEmpty()) {
                $paymentStatus = 'Sin información';
            } elseif ($pendingAmount == 0 && $total > 0) {
                $paymentStatus = 'Pagado';
            } elseif ($overdueCount > 0) {
                $paymentStatus = 'Vencido';
            } elseif ($paidCount > 0 && $pendingCount > 0) {
                $paymentStatus = 'En cuotas';
            } elseif ($total > 0 && $paid == 0) {
                $paymentStatus = 'Pendiente';
            } else {
                $paymentStatus = 'Pendiente';
            }

            // ---------------------------
            //  ESTADO DE LA RESERVA (bookingStatus)
            // ---------------------------
            $bookingStatus = $booking->bookingStatus ?? null;

            switch ($bookingStatus) {
                case 'Pending':
                    $reservationStatus = 'Pendiente de confirmación';
                    break;
                case 'Confirmed':
                    $reservationStatus = 'Confirmada';
                    break;
                case 'Completed':
                    $reservationStatus = 'Completada';
                    break;
                case 'Cancelled':
                    $reservationStatus = 'Cancelada';
                    break;
                default:
                    $reservationStatus = $a->appointmentStatus ?? 'Sin estado';
                    break;
            }

            return [
                'id' => $a->appointmentId,
                'booking_id' => $booking->bookingId,                              // 👈 para pagos/recibos
                'package' => $booking->package?->packageName ?? null,            // 👈 nombre de paquete

                'event_type' => $a->event?->eventType ?? '—',
                'datetime' => Carbon::parse(
                    ($a->appointmentDate ?? '') . ' ' . ($a->appointmentTime ?? '')
                )->toIso8601String(),
                'place' => $a->place,

                'reservation_status' => $reservationStatus,
                'payment_status' => $paymentStatus,

                'document_types' => $documentTypes,
                'appointment_status' => $a->appointmentStatus,

                'payment' => $installments->isEmpty() ? null : [
                    'total' => $total,
                    'paid' => $paid,
                    'installments' => $installments->map(function ($ins) {
                        return [
                            'id' => $ins->id,
                            'amount' => (float) $ins->amount,
                            'due_date' => $ins->due_date
                                ? ($ins->due_date instanceof Carbon
                                    ? $ins->due_date->toIso8601String()
                                    : Carbon::parse($ins->due_date)->toIso8601String())
                                : null,
                            'paid' => $ins->status === 'paid',
                            'paid_at' => $ins->paid_at
                                ? ($ins->paid_at instanceof Carbon
                                    ? $ins->paid_at->toIso8601String()
                                    : Carbon::parse($ins->paid_at)->toIso8601String())
                                : null,
                            'status' => $ins->status,
                            'receipt_path' => $ins->receipt_path,
                            'is_overdue' => $ins->status === 'overdue',
                        ];
                    })->values(),
                ],
            ];
        });

        // Reemplazamos la colección original por la mapeada
        $appointments->setCollection($mapped);

        // Devolvemos el paginador completo (data + meta + links)
        return response()->json($appointments);
    }

    // public function downloadReceipt(Appointment $appointment, BookingPaymentInstallment $installment)
    // {
    //     // Seguridad: asegurar que la cuota pertenece a esa cita y al cliente logueado
    //     if ($installment->booking->appointmentIdFK !== $appointment->appointmentId) {
    //         abort(403);
    //     }

    //     if (!$installment->receipt_path || !Storage::exists($installment->receipt_path)) {
    //         abort(404, 'Recibo no disponible');
    //     }

    //     return Storage::download($installment->receipt_path);
    // }
    public function downloadReceipt(Request $request, Appointment $appointment, BookingPaymentInstallment $installment)
    {
        $user = $request->user();

        // Asegurar que el appointment pertenece al cliente logueado
        if (!$user || !$user->customer || $appointment->customerIdFK !== $user->customer->customerId) {
            abort(403, 'No autorizado');
        }

        // Asegurar que la cuota pertenece a esa cita
        if ($installment->booking->appointmentIdFK !== $appointment->appointmentId) {
            abort(403, 'No autorizado');
        }

        if (!$installment->receipt_path) {
            abort(404, 'No hay recibo para esta cuota');
        }

        $fullPath = storage_path("app/public/" . $installment->receipt_path);

        if (!file_exists($fullPath)) {
            abort(404, 'Archivo no encontrado');
        }

        return response()->download($fullPath);
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
    $baseSlotsWeekday = [
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

    $baseSlotsSunday = [
        '09:00:00',
        '10:00:00',
        '11:00:00',
        '14:00:00',
        '15:00:00',
        '16:00:00',
    ];

    $date  = $request->query('date');
    $month = $request->query('month');
    $year  = $request->query('year', now()->year);

    /* ------------ DÍA ESPECÍFICO ------------ */
    if ($date) {
        $day = Carbon::parse($date);

        // días pasados bloqueados
        if ($day->isBefore(Carbon::today())) {
            return response()->json([
                'available'   => [],
                'blocked'     => [],
                'allBlocked'  => true,
            ]);
        }

        $dayOfWeek = $day->dayOfWeek;
        $baseSlots = ($dayOfWeek === Carbon::SUNDAY)
            ? $baseSlotsSunday
            : $baseSlotsWeekday;

        $appointments = Appointment::whereDate('appointmentDate', $date)
            ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
            ->pluck('appointmentTime')
            ->toArray();

        $available = array_values(array_diff($baseSlots, $appointments));
        $allBlocked = count($available) === 0;

        return response()->json([
            'available'  => $available,
            'blocked'    => $appointments,
            'allBlocked' => $allBlocked,
        ]);
    }

    /* ------------ DISPONIBILIDAD MENSUAL ------------ */
    if ($month) {
        $today = Carbon::today();

        // Traemos todas las citas del mes
        $appointments = Appointment::whereMonth('appointmentDate', $month)
            ->whereYear('appointmentDate', $year)
            ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
            ->get(['appointmentDate', 'appointmentTime']);

        // Agrupamos por fecha
        $grouped = $appointments->groupBy(function ($a) {
            return Carbon::parse($a->appointmentDate)->toDateString(); // Y-m-d
        });

        $days = [];

        $current = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end     = (clone $current)->endOfMonth();

        while ($current->lessThanOrEqualTo($end)) {
            $dateStr   = $current->toDateString();
            $dayOfWeek = $current->dayOfWeek;

            // Past days → bloqueados
            if ($current->isBefore($today)) {
                $days[$dateStr] = ['allBlocked' => true];
                $current->addDay();
                continue;
            }

            // slots según día (mismo criterio que arriba)
            $baseSlotsForDay = ($dayOfWeek === Carbon::SUNDAY)
                ? $baseSlotsSunday
                : $baseSlotsWeekday;

            $taken = ($grouped[$dateStr] ?? collect())
                ->pluck('appointmentTime')
                ->toArray();

            $available = array_diff($baseSlotsForDay, $taken);
            $days[$dateStr] = ['allBlocked' => count($available) === 0];

            $current->addDay();
        }

        return response()->json($days);
    }

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

    /**
     * =======================================================
     *   EMPLEADO → LISTADO DE SUS CITAS
     * =======================================================
     */
    public function employeeAppointments(Request $request)
    {
        $employee = $request->user()->employee;

        if (!$employee) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $rows = Booking::query()
            ->where('employeeIdFK', $employee->employeeId)
            ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
            ->join('customers', 'customers.customerId', '=', 'appointments.customerIdFK')
            ->selectRaw('
                appointments.appointmentId,
                bookings.bookingId,
                appointments.appointmentDate AS date,
                appointments.appointmentTime AS startTime,
                appointments.place,
                appointments.comment,
                appointments.appointmentStatus AS status,
                customers.firstNameCustomer AS firstName,
                customers.lastNameCustomer  AS lastName,
                customers.documentNumber    AS document,
                customers.emailCustomer     AS email
            ')
            ->orderBy('appointments.appointmentDate')
            ->orderBy('appointments.appointmentTime')
            ->get();

        $data = $rows->map(function ($r) {
            return [
                'appointmentId' => $r->appointmentId,
                'bookingId' => $r->bookingId,
                'date' => $r->date,
                'startTime' => $r->startTime,
                'place' => $r->place,
                'comment' => $r->comment,
                'status' => $r->status,
                'clientName' => trim("{$r->firstName} {$r->lastName}"),
                'clientDocument' => $r->document,
                'clientEmail' => $r->email,
            ];
        });

        return response()->json($data);
    }



    /**
     * =======================================================
     *   EMPLEADO → ACTUALIZA UNA CITA
     * =======================================================
     */
    public function updateByEmployee(Request $request, $appointmentId)
    {
        $user = $request->user();

        // Verificar que el usuario tenga empleado asociado
        $employee = $user->employee;
        if (!$employee) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un empleado asociado'
            ], 403);
        }

        // Buscar la cita
        $appointment = Appointment::findOrFail($appointmentId);

        // Asegurarnos de que esta cita está asignada a este empleado mediante un booking
        $booking = Booking::where('appointmentIdFK', $appointment->appointmentId)
            ->where('employeeIdFK', $employee->employeeId)
            ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Esta cita no está asignada a este empleado'
            ], 403);
        }

        // ✅ VALIDACIÓN: lo que acepta la API
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

        // ✅ Actualizar la cita con el texto que maneja tu app
        $appointment->update([
            'appointmentDate' => $data['date'],
            'appointmentTime' => $data['startTime'],
            'place' => $data['place'] ?? $appointment->place,
            'comment' => $data['comment'] ?? $appointment->comment,
            'appointmentStatus' => $data['status'],
        ]);

        // ✅ MAPEO: texto de la API → ENUM de la tabla bookings
        switch ($data['status']) {
            case 'Pending confirmation':
                $bookingStatus = 'Pending';
                break;
            case 'Scheduled':
                $bookingStatus = 'Confirmed';
                break;
            case 'Cancelled':
                $bookingStatus = 'Cancelled';
                break;
            case 'Completed':
                $bookingStatus = 'Completed';
                break;
            default:
                $bookingStatus = 'Pending';
        }

        // ✅ Actualizar booking usando SOLO valores válidos del ENUM
        $booking->update([
            'bookingStatus' => $bookingStatus,
        ]);

        return response()->json([
            'message' => 'Cita actualizada correctamente',
            'appointment' => $appointment->fresh(),
            'booking' => $booking->fresh(),
        ], 200);
    }




    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        //
    }

}
