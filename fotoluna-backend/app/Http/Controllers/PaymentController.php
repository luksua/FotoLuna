<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Customer;
use App\Models\StorageSubscription;
use App\Models\StoragePlan;
use Illuminate\Http\Request;
use App\Models\Booking;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\BookingConfirmedMail;
use Illuminate\Support\Facades\Mail;
use MercadoPago\Exceptions\MPApiException;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;
use App\Notifications\PaymentConfirmedClient;
use Illuminate\Support\Carbon;
class PaymentController extends Controller
{
    public function pay(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,bookingId',
            'transaction_amount' => 'required|numeric|min:0.01',
            'token' => 'required|string',
            'installments' => 'required|integer|min:1',
            'payment_method_id' => 'required|string', // "master", "visa", etc
            'payer' => 'required|array',
            'payer.email' => 'required|email',
            'client_payment_method' => 'nullable|string|in:Card,PSE',
            'installment_id' => 'nullable|integer|exists:booking_payment_installments,id',
        ]);

        // $booking = Booking::with('installments')->findOrFail($data['booking_id']);
        $booking = Booking::with(['installments', 'appointment.customer.user'])
            ->findOrFail($data['booking_id']);

        MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
        $client = new PaymentClient();

        try {
            return DB::transaction(function () use ($client, $data, $booking, $request) {

                // -----------------------------
                // 1) Calcular monto esperado
                // -----------------------------
                $expectedAmount = 0.0;
                $targetInstallments = collect();

                if (!empty($data['installment_id'])) {
                    // pagar una cuota específica
                    $installment = $booking->installments()
                        ->where('id', $data['installment_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    $expectedAmount = (float) $installment->amount;
                    $targetInstallments->push($installment);

                } else {
                    // pagar TODO el saldo (todas las cuotas pendientes)
                    $targetInstallments = $booking->installments()
                        ->where('status', 'pending')
                        ->orderBy('due_date')
                        ->lockForUpdate()
                        ->get();

                    $expectedAmount = (float) $targetInstallments->sum('amount');
                }

                if (round((float) $data['transaction_amount'], 2) !== round($expectedAmount, 2)) {
                    return response()->json([
                        'message' => 'El monto enviado no coincide con el total calculado.',
                        'expected' => $expectedAmount,
                    ], 422);
                }

                // -----------------------------
                // 2) Crear pago en Mercado Pago
                // -----------------------------
                $mpPayment = $client->create([
                    'transaction_amount' => (float) $data['transaction_amount'],
                    'token' => $data['token'],
                    'description' => 'Pago de reserva #' . $booking->bookingId,
                    'installments' => $data['installments'],
                    'payment_method_id' => $data['payment_method_id'], // master, visa, etc
                    'payer' => [
                        'email' => $data['payer']['email'],
                    ],
                ]);

                // -----------------------------
                // 3) Registrar Payment local
                // -----------------------------
                $localPayment = Payment::create([
                    'bookingIdFK' => $booking->bookingId,
                    'amount' => $data['transaction_amount'],
                    'paymentDate' => now(),

                    // AQUÍ EL CAMBIO IMPORTANTE
                    // guarda Card / PSE (lógico), NO "master"
                    'paymentMethod' => $request->input('client_payment_method') ?? 'Card',

                    'installments' => $data['installments'],
                    'mp_payment_id' => $mpPayment->id,
                    'paymentStatus' => $mpPayment->status,
                ]);

                // -----------------------------
                // 4) Marcar cuotas como pagadas
                // -----------------------------
                if ($mpPayment->status === 'approved') {

                    $remainingToApply = (float) $data['transaction_amount'];

                    foreach ($targetInstallments as $ins) {
                        if ($remainingToApply <= 0) {
                            break;
                        }

                        if ($remainingToApply >= $ins->amount) {
                            $ins->status = 'paid';
                            $ins->paid_at = now();
                            $ins->paymentIdFK = $localPayment->paymentId ?? null;
                            $ins->save();

                            $remainingToApply -= $ins->amount;
                        } else {
                            // (por ahora no manejas pago parcial de una sola cuota)
                            break;
                        }
                    }
                    // DISPARO DE NOTIFICACIÓN AL CLIENTE
                    $customerUser = optional($booking->appointment?->customer)->user;

                    if ($customerUser) {
                        $customerUser->notify(
                            new PaymentConfirmedClient($booking, $localPayment, $targetInstallments)
                        );
                    }
                }

                return response()->json([
                    'status' => $mpPayment->status,
                    'status_detail' => $mpPayment->status_detail,
                    'id' => $mpPayment->id,
                ]);
            });

        } catch (MPApiException $e) {
            return response()->json([
                'message' => 'Error al procesar el pago con Mercado Pago.',
                'error' => $e->getMessage(),
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error interno al registrar el pago.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function payStoragePlan(Request $request)
    {
        $data = $request->validate([
            'storage_plan_id' => 'required|integer|exists:storage_plans,id',
            'transaction_amount' => 'required|numeric|min:0.01',
            'token' => 'required|string',
            'installments' => 'required|integer|min:1',
            'payment_method_id' => 'required|string',
            'payer.email' => 'required|email',
            'client_payment_method' => 'nullable|string|in:Card,PSE',
        ]);

        $user = $request->user();
        $customer = Customer::where('user_id', $user->id)->firstOrFail();
        $plan = StoragePlan::findOrFail($data['storage_plan_id']);

        // Validación lógica
        if ((float) $data['transaction_amount'] !== (float) $plan->price) {
            return response()->json([
                'message' => 'El monto enviado no coincide con el valor del plan.',
                'expected' => $plan->price,
            ], 422);
        }

        MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
        $client = new PaymentClient();

        try {
            return DB::transaction(function () use ($client, $data, $plan, $customer, $request) {

                // 1) Crear pago con MP
                $mpPayment = $client->create([
                    'transaction_amount' => (float) $data['transaction_amount'],
                    'token' => $data['token'],
                    'description' => 'Compra de plan de almacenamiento: ' . $plan->name,
                    'installments' => $data['installments'],
                    'payment_method_id' => $data['payment_method_id'],
                    'payer' => [
                        'email' => $data['payer']['email'],
                    ],
                ]);

                if ($mpPayment->status !== 'approved') {
                    return response()->json([
                        'status' => $mpPayment->status,
                        'status_detail' => $mpPayment->status_detail,
                    ], 400);
                }

                // 2) Registrar el pago si quieres guardarlo
                $localPayment = Payment::create([
                    'bookingIdFK' => null, // ES PAGO DE PLAN, NO DE BOOKING
                    'amount' => $data['transaction_amount'],
                    'paymentDate' => now(),
                    'paymentMethod' => $request->input('client_payment_method') ?? 'Card',
                    'installments' => $data['installments'],
                    'mp_payment_id' => $mpPayment->id,
                    'paymentStatus' => $mpPayment->status,
                ]);

                // 3) Cancelar suscripción activa anterior
                StorageSubscription::where('customerIdFK', $customer->customerId)
                    ->where('status', 'active')
                    ->update(['status' => 'cancelled']);

                // 4) Crear nueva suscripción
                $startsAt = now();
                $endsAt = now()->addMonths($plan->duration_months);

                StorageSubscription::create([
                    'customerIdFK' => $customer->customerId,
                    'plan_id' => $plan->id,
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'status' => 'active',
                    'payment_id' => $localPayment->paymentId ?? null,
                    'mp_payment_id' => $mpPayment->id,
                ]);

                return response()->json([
                    'status' => $mpPayment->status,
                    'status_detail' => $mpPayment->status_detail,
                ]);
            });

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error interno al pagar el plan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function payOnline(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0',
            'paymentMethod' => 'required|string',
            'status' => 'required|string',   // "approved", "in_process", etc.
            'mp_payment_id' => 'nullable|string',
            'installments' => 'nullable|integer',
            'storagePlanId' => 'nullable|integer',  // si lo estás mandando desde el front
        ]);

        // Guardar el pago
        $payment = Payment::create([
            'bookingIdFK' => $booking->bookingId,
            'amount' => $data['amount'],
            'paymentMethod' => $data['paymentMethod'],
            'paymentStatus' => $data['status'],        // <= importante
            'paymentDate' => now(),
            'mp_payment_id' => $data['mp_payment_id'] ?? null,
        ]);

        // Si hay plan de nube y el pago fue aprobado, creamos la suscripción
        if (!empty($data['storagePlanId']) && $data['status'] === 'approved') {
            StorageSubscription::create([
                'customerIdFK' => $booking->appointment?->customer?->customerId,
                'plan_id' => $data['storagePlanId'],
                'bookingIdFK' => $booking->bookingId,
                'starts_at' => now(),
                'ends_at' => now()->addMonths(6), // o según duración del plan
                'status' => 'active',
                'payment_id' => $payment->paymentId ?? null,
                'mp_payment_id' => $payment->mp_payment_id,
            ]);
        }

        // 👇 AQUÍ DISPARAMOS EL CORREO SOLO SI EL PAGO ESTÁ APROBADO
        if ($data['status'] === 'approved') {
            $this->sendBookingConfirmationEmail($booking, $payment);
        }

        return response()->json([
            'message' => 'Pago registrado',
            'status' => $data['status'],
        ]);
    }

    public function receipt(Payment $payment)
    {
        $payment->load('booking.appointment.customer');

        $pdf = Pdf::loadView('pdf.receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'customer' => $payment->booking->appointment->customer,
        ]);

        return $pdf->download("receipt-{$payment->paymentId}.pdf");
    }

    // public function pay(Request $request)
    // {
    //     try {
    //         // 1. Validar datos
    //         $validated = $request->validate([
    //             'booking_id' => 'required|exists:bookings,bookingId',
    //             'transaction_amount' => 'required|numeric|min:1',
    //             'payment_method_id' => 'required|string',
    //             'token' => 'required|string',
    //             'installments' => 'nullable|integer|min:1',
    //             'payer.email' => 'required|email',
    //             'client_payment_method' => 'nullable|string|in:Card,PSE',
    //         ]);

    //         // 2. Booking
    //         $booking = Booking::where('bookingId', $validated['booking_id'])->firstOrFail();

    //         // 3. SDK nuevo
    //         MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

    //         $client = new PaymentClient();

    //         // 4. Crear pago EN TRY para capturar exceptions
    //         try {
    //             $payment = $client->create([
    //                 'transaction_amount' => (float) $validated['transaction_amount'],
    //                 'token' => $validated['token'],
    //                 'installments' => $validated['installments'] ?? 1,
    //                 'payment_method_id' => $validated['payment_method_id'],
    //                 'payer' => [
    //                     'email' => $validated['payer']['email'],
    //                 ],
    //             ]);
    //         } catch (\Exception $mpError) {

    //             return response()->json([
    //                 'message' => 'Error al comunicarse con Mercado Pago',
    //                 'mp_error' => $mpError->getMessage(),
    //             ], 422);
    //         }

    //         // Si Mercado Pago respondió con error interno
    //         if (isset($payment->error)) {
    //             return response()->json([
    //                 'message' => 'Mercado Pago rechazó la operación.',
    //                 'mp_error' => $payment->error,
    //             ], 422);
    //         }

    //         // 5. Registrar en payments
    //         $localPayment = Payment::create([
    //             'bookingIdFK' => $booking->bookingId,
    //             'amount' => $validated['transaction_amount'],
    //             'paymentDate' => now(),
    //             'paymentMethod' => $validated['client_payment_method'] ?? 'Card',
    //             'paymentStatus' => $payment->status,
    //             'installments' => $validated['installments'] ?? $payment->installments ?? null,
    //             'mp_payment_id' => $payment->id ?? null,
    //             'card_last_four' => $payment->card?->last_four_digits ?? null,
    //         ]);

    //         // 6. Actualizar Booking
    //         if ($payment->status === 'approved') {
    //             $booking->update(['bookingStatus' => 'Confirmed']);
    //         }

    //         return response()->json([
    //             'status' => $payment->status,
    //             'payment' => $localPayment,
    //             'mp_payment' => $payment,
    //         ]);

    //     } catch (\Throwable $e) {
    //         return response()->json([
    //             'message' => 'Error interno al procesar el pago.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }



    public function storeOffline(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'paymentMethod' => 'required|string|in:Cash,Nequi,Daviplata,Transfer',
            'paymentReference' => 'nullable|string|max:255',
        ]);

        $payment = Payment::create([
            'bookingIdFK' => $booking->bookingId,
            'amount' => $validated['amount'],
            'paymentDate' => now(),
            'paymentMethod' => $validated['paymentMethod'],
            'paymentStatus' => 'PendingConfirmation',
        ]);

        $booking->update([
            'bookingStatus' => 'PendingPaymentConfirmation',
        ]);

        return response()->json([
            'message' => 'Pago registrado correctamente. Pendiente de confirmación.',
            'payment' => $payment,
        ], 201);
    }
    // empleado
    public function employeePayments(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        $query = Payment::with([
            'booking',
            'booking.appointment.customer',
            'booking.appointment.event',
            'booking.package',
            'booking.installments',
        ])
            ->whereHas('booking', function ($q) use ($employee) {
                $q->where('employeeIdFK', $employee->employeeId);
            });

        $statusFilter = $request->query('status'); // all | paid | pending | overdue | partial | no_info

        $clientSearch = $request->query('client');
        if (!empty($clientSearch)) {
            $query->whereHas('booking.appointment.customer', function ($q) use ($clientSearch) {
                $q->where('firstNameCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('lastNameCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('documentNumber', 'like', "%{$clientSearch}%")
                    ->orWhere('emailCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('phoneCustomer', 'like', "%{$clientSearch}%");
            });
        }

        if ($from = $request->query('from_date')) {
            $query->whereDate('paymentDate', '>=', $from);
        }
        if ($to = $request->query('to_date')) {
            $query->whereDate('paymentDate', '<=', $to);
        }

        $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderByRaw('COALESCE(paymentDate, created_at) ' . $order);

        // 👇 En vez de paginar aquí:
        // $payments = $query->paginate($perPage);
        // Traemos todos (si te preocupa rendimiento, luego vemos límites)
        $payments = $query->get();

        // --------- Mapeo al formato de frontend ---------
        $collection = $payments->map(function (Payment $payment) {
            $booking = $payment->booking;
            $appointment = $booking?->appointment;
            $customer = $appointment?->customer;
            $event = $appointment?->event;
            $package = $booking?->package;
            $installments = $booking?->installments ?? collect();
            $date = $payment->paymentDate
                ? \Carbon\Carbon::parse($payment->paymentDate)
                : $payment->created_at;

            // ---------------------------
            // NORMALIZAR ESTADO
            // ---------------------------
            $normalizedStatus = 'no_info';

            if ($installments->isEmpty()) {
                // 🔹 Caso SIN cuotas: pago único
                if (in_array($payment->paymentStatus, ['approved', 'paid'])) {
                    $normalizedStatus = 'paid';
                } elseif (in_array($payment->paymentStatus, ['pending', 'in_process'])) {
                    $normalizedStatus = 'pending';
                } else {
                    $normalizedStatus = 'no_info';
                }
            } else {
                // 🔹 Caso CON cuotas: usamos solo las cuotas
                $total = (float) $installments->sum('amount');
                $paid = (float) $installments->where('status', 'paid')->sum('amount');
                $overdueCount = $installments->where('status', 'overdue')->count();
                $pendingCount = $installments->where('status', 'pending')->count();

                if ($total > 0 && $paid >= $total) {
                    $normalizedStatus = 'paid';
                } elseif ($overdueCount > 0) {
                    $normalizedStatus = 'overdue';
                } elseif ($paid > 0 && $paid < $total) {
                    $normalizedStatus = 'partial';   // en cuotas
                } elseif ($total > 0 && $paid == 0 && $pendingCount > 0) {
                    $normalizedStatus = 'pending';
                } else {
                    $normalizedStatus = 'no_info';
                }
            }

            // ---------------------------
            // CUOTAS + TOTALES
            // ---------------------------
            if ($installments->isEmpty()) {
                // 🔹 SIN cuotas reales → cuota única virtual
                $installment = [
                    'current' => 1,
                    'total' => 1,
                ];

                $installmentAmount = (float) $payment->amount;
                $dueDate = optional($date)->format('Y-m-d');

                // totalAmount = lo que se pagó en este pago único
                $totalAmount = (float) $payment->amount;

                $normalizedInstallments = collect([
                    [
                        'id' => null,
                        'amount' => (float) $payment->amount,
                        'due_date' => optional($date)->toIso8601String(),
                        'paid' => in_array($normalizedStatus, ['paid'], true),
                        'paid_at' => optional($date)->toIso8601String(),
                        'status' => $normalizedStatus,
                        'is_overdue' => false,
                        'receipt_path' => null,
                    ],
                ]);
            } else {
                // 🔹 CON cuotas reales
                $sorted = $installments->sortBy('number');
                $current = $sorted->firstWhere('status', 'pending') ?? $sorted->last();

                $installment = [
                    'current' => (int) $current->number,
                    'total' => (int) $installments->count(),
                ];

                $installmentAmount = (float) $current->amount;
                $dueDate = optional($current->due_date ?? $current->created_at)->format('Y-m-d');

                // 💡 totalAmount = suma de todas las cuotas (incluye plan de almacenamiento,
                // porque viene de installments-plan con grandTotal)
                $totalAmount = (float) $installments->sum('amount');

                $normalizedInstallments = $installments->map(function ($ins) {
                    return [
                        'id' => $ins->id,
                        'amount' => (float) $ins->amount,
                        'due_date' => optional($ins->due_date)->toIso8601String(),
                        'paid' => $ins->status === 'paid',
                        'paid_at' => $ins->paid_at
                            ? ($ins->paid_at instanceof \Carbon\Carbon
                                ? $ins->paid_at->toIso8601String()
                                : \Carbon\Carbon::parse($ins->paid_at)->toIso8601String())
                            : null,
                        'status' => $ins->status,
                        'is_overdue' => $ins->status === 'overdue',
                        'receipt_path' => $ins->receipt_path,
                    ];
                });
            }

            // ---------------------------
            // Datos cliente y descripción
            // ---------------------------
            $clientName = trim(
                ($customer->firstNameCustomer ?? '') . ' ' .
                ($customer->lastNameCustomer ?? '')
            );

            return [
                'id' => (int) $payment->paymentId,
                'booking_id' => $booking?->bookingId,
                'appointment_id' => $appointment?->appointmentId,
                'date' => optional($date)->format('Y-m-d'),
                'clientName' => $clientName,
                'clientCedula' => $customer->documentNumber ?? '',
                'clientEmail' => $customer->emailCustomer ?? '',
                'clientPhone' => $customer->phoneCustomer ?? '',
                'description' => ($package->packageName ?? 'Sin paquete') . ' - ' .
                    ($event->eventType ?? 'Sin evento'),
                'installment' => $installment,
                'installmentAmount' => $installmentAmount,
                'totalAmount' => $totalAmount,
                'status' => $normalizedStatus,
                'dueDate' => $dueDate,
                'installments' => $normalizedInstallments->values(),
            ];
        });

        // --------- Filtro final por estado normalizado ---------
        if ($statusFilter && $statusFilter !== 'all') {
            $collection = $collection->filter(function ($row) use ($statusFilter) {
                // "Pendiente" incluye también "En cuotas" (partial)
                if ($statusFilter === 'pending') {
                    return in_array($row['status'], ['pending', 'partial'], true);
                }

                // "En cuotas" = status 'partial'
                if ($statusFilter === 'partial') {
                    return $row['status'] === 'partial';
                }

                return $row['status'] === $statusFilter;
            })->values();
        }

        // --------- Paginación manual sobre el resultado filtrado ---------
        $perPage = (int) $request->query('per_page', 5);
        $page = (int) $request->query('page', 1);

        $total = $collection->count();
        $lastPage = (int) max(1, ceil($total / $perPage));

        $items = $collection
            ->forPage($page, $perPage)
            ->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
        ]);
    }
    // public function employeePayments(Request $request)
    // {
    //     $user = $request->user();

    //     $employee = Employee::where('user_id', $user->id)->firstOrFail();

    //     $query = Payment::with([
    //         'booking',
    //         'booking.appointment.customer',
    //         'booking.appointment.event',
    //         'booking.package',
    //         'booking.installments',
    //     ])->whereHas('booking', function ($q) use ($employee) {
    //         $q->where('employeeIdFK', $employee->employeeId);
    //     });

    //     // --------- Filtros de query ---------
    //     $statusFilter = $request->query('status'); // all | paid | pending | overdue | partial | no_info

    //     // Solo filtramos en BD por pago aprobado
    //     if ($statusFilter === 'paid') {
    //         $query->whereIn('paymentStatus', ['approved', 'paid']);
    //     }

    //     $clientSearch = $request->query('client');
    //     if (!empty($clientSearch)) {
    //         $query->whereHas('booking.appointment.customer', function ($q) use ($clientSearch) {
    //             $q->where('firstNameCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('lastNameCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('documentNumber', 'like', "%{$clientSearch}%")
    //                 ->orWhere('emailCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('phoneCustomer', 'like', "%{$clientSearch}%");
    //         });
    //     }

    //     if ($from = $request->query('from_date')) {
    //         $query->whereDate('paymentDate', '>=', $from);
    //     }
    //     if ($to = $request->query('to_date')) {
    //         $query->whereDate('paymentDate', '<=', $to);
    //     }

    //     $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
    //     $query->orderByRaw('COALESCE(paymentDate, created_at) ' . $order);

    //     $perPage = (int) $request->query('per_page', 5);
    //     $payments = $query->paginate($perPage);

    //     // --------- Mapeo al formato de frontend ---------
    //     $collection = $payments->getCollection()->map(function (Payment $payment) {

    //         $booking = $payment->booking;
    //         $appointment = $booking?->appointment;
    //         $customer = $appointment?->customer;
    //         $event = $appointment?->event;
    //         $package = $booking?->package;
    //         $installments = $booking?->installments ?? collect();
    //         $date = $payment->paymentDate ?? $payment->created_at;

    //         // ---------------------------
    //         // NORMALIZAR ESTADO
    //         // ---------------------------
    //         $normalizedStatus = 'no_info';

    //         if ($installments->isEmpty()) {
    //             // 🔹 Caso SIN cuotas: pago único
    //             if (in_array($payment->paymentStatus, ['approved', 'paid'])) {
    //                 $normalizedStatus = 'paid';
    //             } elseif (in_array($payment->paymentStatus, ['pending', 'in_process'])) {
    //                 $normalizedStatus = 'pending';
    //             } else {
    //                 $normalizedStatus = 'no_info';
    //             }
    //         } else {
    //             // 🔹 Caso CON cuotas: usamos solo las cuotas
    //             $total = (float) $installments->sum('amount');
    //             $paid = (float) $installments->where('status', 'paid')->sum('amount');
    //             $overdueCount = $installments->where('status', 'overdue')->count();
    //             $pendingCount = $installments->where('status', 'pending')->count();

    //             if ($total > 0 && $paid >= $total) {
    //                 $normalizedStatus = 'paid';
    //             } elseif ($overdueCount > 0) {
    //                 $normalizedStatus = 'overdue';
    //             } elseif ($paid > 0 && $paid < $total) {
    //                 $normalizedStatus = 'partial';   // en cuotas
    //             } elseif ($total > 0 && $paid == 0 && $pendingCount > 0) {
    //                 $normalizedStatus = 'pending';
    //             } else {
    //                 $normalizedStatus = 'no_info';
    //             }
    //         }

    //         // ---------------------------
    //         // CUOTAS + TOTALES
    //         // ---------------------------
    //         if ($installments->isEmpty()) {
    //             // 🔹 SIN cuotas reales → cuota única virtual
    //             $installment = [
    //                 'current' => 1,
    //                 'total' => 1,
    //             ];

    //             $installmentAmount = (float) $payment->amount;
    //             $dueDate = optional($date)->format('Y-m-d');

    //             // totalAmount = lo que se pagó en este pago único
    //             $totalAmount = (float) $payment->amount;

    //             $normalizedInstallments = collect([
    //                 [
    //                     'id' => null,
    //                     'amount' => (float) $payment->amount,
    //                     'due_date' => optional($date)->toIso8601String(),
    //                     'paid' => in_array($normalizedStatus, ['paid'], true),
    //                     'paid_at' => optional($date)->toIso8601String(),
    //                     'status' => $normalizedStatus,
    //                     'is_overdue' => false,
    //                     'receipt_path' => null,
    //                 ],
    //             ]);
    //         } else {
    //             // 🔹 CON cuotas reales
    //             $sorted = $installments->sortBy('number');
    //             $current = $sorted->firstWhere('status', 'pending') ?? $sorted->last();

    //             $installment = [
    //                 'current' => (int) $current->number,
    //                 'total' => (int) $installments->count(),
    //             ];

    //             $installmentAmount = (float) $current->amount;
    //             $dueDate = optional($current->due_date ?? $current->created_at)->format('Y-m-d');

    //             // 💡 totalAmount = suma de todas las cuotas (incluye plan de almacenamiento,
    //             // porque viene de installments-plan con grandTotal)
    //             $totalAmount = (float) $installments->sum('amount');

    //             $normalizedInstallments = $installments->map(function ($ins) {
    //                 return [
    //                     'id' => $ins->id,
    //                     'amount' => (float) $ins->amount,
    //                     'due_date' => optional($ins->due_date)->toIso8601String(),
    //                     'paid' => $ins->status === 'paid',
    //                     'paid_at' => $ins->paid_at
    //                         ? ($ins->paid_at instanceof \Carbon\Carbon
    //                             ? $ins->paid_at->toIso8601String()
    //                             : \Carbon\Carbon::parse($ins->paid_at)->toIso8601String())
    //                         : null,
    //                     'status' => $ins->status,
    //                     'is_overdue' => $ins->status === 'overdue',
    //                     'receipt_path' => $ins->receipt_path,
    //                 ];
    //             });
    //         }

    //         // ---------------------------
    //         // Datos cliente y descripción
    //         // ---------------------------
    //         $clientName = trim(
    //             ($customer->firstNameCustomer ?? '') . ' ' .
    //             ($customer->lastNameCustomer ?? '')
    //         );

    //         return [
    //             'id' => (int) $payment->paymentId,
    //             'booking_id' => $booking?->bookingId,
    //             'appointment_id' => $appointment?->appointmentId,

    //             'date' => optional($date)->format('Y-m-d'),
    //             'clientName' => $clientName,
    //             'clientCedula' => $customer->documentNumber ?? '',
    //             'clientEmail' => $customer->emailCustomer ?? '',
    //             'clientPhone' => $customer->phoneCustomer ?? '',

    //             'description' => ($package->packageName ?? 'Sin paquete') . ' - ' .
    //                 ($event->eventType ?? 'Sin evento'),

    //             'installment' => $installment,
    //             'installmentAmount' => $installmentAmount,

    //             // 👇 ya incluye plan de almacenamiento si vino en las cuotas
    //             'totalAmount' => $totalAmount,

    //             'status' => $normalizedStatus,
    //             'dueDate' => $dueDate,

    //             // Para usar en modales de detalle
    //             'installments' => $normalizedInstallments->values(),
    //         ];
    //     });

    //     // --------- Filtro final por estado normalizado ---------
    //     if ($statusFilter && $statusFilter !== 'all') {
    //         $collection = $collection->filter(function ($row) use ($statusFilter) {
    //             // El filtro "pending" incluye también "partial" (en cuotas)
    //             if ($statusFilter === 'pending') {
    //                 return in_array($row['status'], ['pending', 'partial'], true);
    //             }
    //             return $row['status'] === $statusFilter;
    //         })->values();
    //     }

    //     $payments->setCollection($collection);

    //     return response()->json([
    //         'data' => $payments->items(),
    //         'meta' => [
    //             'current_page' => $payments->currentPage(),
    //             'per_page' => $payments->perPage(),
    //             'total' => $payments->total(),
    //             'last_page' => $payments->lastPage(),
    //         ],
    //     ]);
    // }

    public function index(Request $request)
    {
        $query = Payment::query()
            ->with(['booking.customer.user']); // ajusta a tus relaciones reales

        if ($search = $request->input('search')) {
            $query->where('paymentId', $search)
                ->orWhereHas('booking.customer', function ($q) use ($search) {
                    $q->where('emailCustomer', 'like', "%{$search}%")
                        ->orWhere('firstNameCustomer', 'like', "%{$search}%")
                        ->orWhere('lastNameCustomer', 'like', "%{$search}%");
                });
        }

        if ($status = $request->input('status')) {
            $query->where('paymentStatus', $status);
        }

        if ($from = $request->input('from')) {
            $query->whereDate('paymentDate', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('paymentDate', '<=', $to);
        }

        $payments = $query
            ->orderByDesc('paymentDate')
            ->paginate($request->input('per_page', 10));

        return response()->json($payments);
    }

    public function summary()
    {
        $totalApproved = Payment::where('paymentStatus', 'approved')->sum('amount');
        $pendingCount = Payment::where('paymentStatus', 'pending')->count();
        $approvedCount = Payment::where('paymentStatus', 'approved')->count();

        return response()->json([
            'totalApprovedAmount' => $totalApproved,
            'pendingCount' => $pendingCount,
            'approvedCount' => $approvedCount,
            // aquí puedes añadir variaciones (% vs mes pasado, etc.)
        ]);
    }

    public function bookingPayments(Request $request)
    {
        $query = Payment::with([
            'booking',
            'booking.appointment.customer',
            'booking.appointment.event',
            'booking.package',
            'booking.installments',
        ]);

        // --------- Filtros de query ---------
        $statusFilter = $request->query('status'); // all | paid | pending | overdue | partial | no_info

        // Solo filtramos en BD por pago aprobado
        if ($statusFilter === 'paid') {
            $query->whereIn('paymentStatus', ['approved', 'paid']);
        }

        $clientSearch = $request->query('client');
        if (!empty($clientSearch)) {
            $query->whereHas('booking.appointment.customer', function ($q) use ($clientSearch) {
                $q->where('firstNameCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('lastNameCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('documentNumber', 'like', "%{$clientSearch}%")
                    ->orWhere('emailCustomer', 'like', "%{$clientSearch}%")
                    ->orWhere('phoneCustomer', 'like', "%{$clientSearch}%");
            });
        }

        if ($from = $request->query('from_date')) {
            $query->whereDate('paymentDate', '>=', $from);
        }
        if ($to = $request->query('to_date')) {
            $query->whereDate('paymentDate', '<=', $to);
        }

        $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderByRaw('COALESCE(paymentDate, created_at) ' . $order);

        // 👇 Traemos todos y paginamos en memoria para que el filtro por status funcione bien
        $payments = $query->get();

        // --------- Mapeo al formato de frontend (igual que employeePayments) ---------
        $collection = $payments->map(function (Payment $payment) {
            $booking = $payment->booking;
            $appointment = $booking?->appointment;
            $customer = $appointment?->customer;
            $event = $appointment?->event;
            $package = $booking?->package;
            $installments = $booking?->installments ?? collect();
            $date = $payment->paymentDate
                ? \Carbon\Carbon::parse($payment->paymentDate)
                : $payment->created_at;

            // ---------------------------
            // NORMALIZAR ESTADO
            // ---------------------------
            $normalizedStatus = 'no_info';

            if ($installments->isEmpty()) {
                // 🔹 SIN cuotas: pago único
                if (in_array($payment->paymentStatus, ['approved', 'paid'])) {
                    $normalizedStatus = 'paid';
                } elseif (in_array($payment->paymentStatus, ['pending', 'in_process'])) {
                    $normalizedStatus = 'pending';
                } else {
                    $normalizedStatus = 'no_info';
                }
            } else {
                // 🔹 CON cuotas reales
                $total = (float) $installments->sum('amount');
                $paid = (float) $installments->where('status', 'paid')->sum('amount');
                $overdueCount = $installments->where('status', 'overdue')->count();
                $pendingCount = $installments->where('status', 'pending')->count();

                if ($total > 0 && $paid >= $total) {
                    $normalizedStatus = 'paid';
                } elseif ($overdueCount > 0) {
                    $normalizedStatus = 'overdue';
                } elseif ($paid > 0 && $paid < $total) {
                    $normalizedStatus = 'partial';   // en cuotas
                } elseif ($total > 0 && $paid == 0 && $pendingCount > 0) {
                    $normalizedStatus = 'pending';
                } else {
                    $normalizedStatus = 'no_info';
                }
            }

            // ---------------------------
            // CUOTAS + TOTALES
            // ---------------------------
            if ($installments->isEmpty()) {
                // 🔹 SIN cuotas reales → cuota única virtual
                $installment = [
                    'current' => 1,
                    'total' => 1,
                ];

                $installmentAmount = (float) $payment->amount;
                $dueDate = optional($date)->format('Y-m-d');
                $totalAmount = (float) $payment->amount;

                $normalizedInstallments = collect([
                    [
                        'id' => null,
                        'amount' => (float) $payment->amount,
                        'due_date' => optional($date)->toIso8601String(),
                        'paid' => in_array($normalizedStatus, ['paid'], true),
                        'paid_at' => optional($date)->toIso8601String(),
                        'status' => $normalizedStatus,
                        'is_overdue' => false,
                        'receipt_path' => null,
                    ],
                ]);
            } else {
                // 🔹 CON cuotas reales
                $sorted = $installments->sortBy('number');
                $current = $sorted->firstWhere('status', 'pending') ?? $sorted->last();

                $installment = [
                    'current' => (int) $current->number,
                    'total' => (int) $installments->count(),
                ];

                $installmentAmount = (float) $current->amount;
                $dueDate = optional($current->due_date ?? $current->created_at)->format('Y-m-d');
                $totalAmount = (float) $installments->sum('amount');

                $normalizedInstallments = $installments->map(function ($ins) {
                    return [
                        'id' => $ins->id,
                        'amount' => (float) $ins->amount,
                        'due_date' => optional($ins->due_date)->toIso8601String(),
                        'paid' => $ins->status === 'paid',
                        'paid_at' => $ins->paid_at
                            ? ($ins->paid_at instanceof \Carbon\Carbon
                                ? $ins->paid_at->toIso8601String()
                                : \Carbon\Carbon::parse($ins->paid_at)->toIso8601String())
                            : null,
                        'status' => $ins->status,
                        'is_overdue' => $ins->status === 'overdue',
                        'receipt_path' => $ins->receipt_path,
                    ];
                });
            }

            $clientName = trim(
                ($customer->firstNameCustomer ?? '') . ' ' .
                ($customer->lastNameCustomer ?? '')
            );

            return [
                'id' => (int) $payment->paymentId,
                'booking_id' => $booking?->bookingId,
                'appointment_id' => $appointment?->appointmentId,

                'date' => optional($date)->format('Y-m-d'),
                'clientName' => $clientName,
                'clientCedula' => $customer->documentNumber ?? '',
                'clientEmail' => $customer->emailCustomer ?? '',
                'clientPhone' => $customer->phoneCustomer ?? '',

                'description' => ($package->packageName ?? 'Sin paquete') . ' - ' .
                    ($event->eventType ?? 'Sin evento'),

                'installment' => $installment,
                'installmentAmount' => $installmentAmount,
                'totalAmount' => $totalAmount,

                'status' => $normalizedStatus,
                'dueDate' => $dueDate,

                'installments' => $normalizedInstallments->values(),
            ];
        });

        // --------- Filtro final por estado normalizado ---------
        if ($statusFilter && $statusFilter !== 'all') {
            $collection = $collection->filter(function ($row) use ($statusFilter) {
                if ($statusFilter === 'pending') {
                    return in_array($row['status'], ['pending', 'partial'], true);
                }
                return $row['status'] === $statusFilter;
            })->values();
        }

        // --------- Paginación en memoria ---------
        $perPage = (int) $request->query('per_page', 5);
        $page = (int) $request->query('page', 1);

        $total = $collection->count();
        $lastPage = (int) max(1, ceil($total / $perPage));

        $items = $collection
            ->forPage($page, $perPage)
            ->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
        ]);
    }

    // public function employeePayments(Request $request)
    // {
    //     // Usuario logueado (Sanctum / token)
    //     $user = $request->user();

    //     // Buscar empleado asociado al usuario
    //     $employee = Employee::where('user_id', $user->id)->firstOrFail();

    //     // Query base: pagos de bookings que pertenecen a ese empleado
    //     $query = Payment::with([
    //         'booking',
    //         'booking.appointment.customer',
    //         'booking.appointment.event',
    //         'booking.package',          // <-- usamos el paquete desde booking
    //         'booking.installments',
    //     ])
    //         ->whereHas('booking', function ($q) use ($employee) {
    //             $q->where('employeeIdFK', $employee->employeeId);
    //         });

    //     // --------- Filtros ---------

    //     // Estado: all | paid | pending | overdue
    //     $status = $request->query('status');
    //     if ($status && $status !== 'all') {
    //         if ($status === 'paid') {
    //             $query->whereIn('paymentStatus', ['approved', 'paid']);
    //         } else {
    //             $query->where('paymentStatus', $status);
    //         }
    //     }

    //     // Búsqueda por cliente / cédula / correo / teléfono
    //     $clientSearch = $request->query('client');
    //     if (!empty($clientSearch)) {
    //         $query->whereHas('booking.appointment.customer', function ($q) use ($clientSearch) {
    //             $q->where('firstNameCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('lastNameCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('documentNumber', 'like', "%{$clientSearch}%")
    //                 ->orWhere('emailCustomer', 'like', "%{$clientSearch}%")
    //                 ->orWhere('phoneCustomer', 'like', "%{$clientSearch}%");
    //         });
    //     }

    //     // Rango de fechas (opcional)
    //     if ($from = $request->query('from_date')) {
    //         $query->whereDate('paymentDate', '>=', $from);
    //     }
    //     if ($to = $request->query('to_date')) {
    //         $query->whereDate('paymentDate', '<=', $to);
    //     }

    //     // Orden por fecha (más nuevo / más viejo)
    //     $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
    //     $query->orderByRaw('COALESCE(paymentDate, created_at) ' . $order);

    //     // Paginación
    //     $perPage = (int) $request->query('per_page', 5);
    //     $payments = $query->paginate($perPage);

    //     // Transformar datos para el frontend
    //     $collection = $payments->getCollection()->map(function (Payment $payment) {

    //         $booking = $payment->booking;
    //         $appointment = $booking?->appointment;
    //         $customer = $appointment?->customer;
    //         $event = $appointment?->event;
    //         $package = $booking?->package;              // <-- aquí solo booking->package
    //         $installments = $booking?->installments ?? collect();

    //         // Normalizar estado
    //         $status = $payment->paymentStatus;
    //         if ($status === 'approved') {
    //             $status = 'paid';
    //         }

    //         // Fecha
    //         $date = $payment->paymentDate ?? $payment->created_at;

    //         // Calcular cuotas
    //         if ($installments->count() > 1) {
    //             $sorted = $installments->sortBy('number');
    //             $current = $sorted->firstWhere('status', 'pending') ?? $sorted->last();

    //             $installment = [
    //                 'current' => (int) $current->number,
    //                 'total' => (int) $installments->count(),
    //             ];

    //             $installmentAmount = (float) $current->amount;
    //             $dueDate = optional($current->created_at)->format('Y-m-d');
    //         } else {
    //             $installment = [
    //                 'current' => 1,
    //                 'total' => 1,
    //             ];

    //             $installmentAmount = (float) $payment->amount;
    //             $dueDate = null;
    //         }

    //         // Datos de cliente
    //         $clientName = trim(
    //             ($customer->firstNameCustomer ?? '') . ' ' .
    //             ($customer->lastNameCustomer ?? '')
    //         );

    //         return [
    //             'id' => (int) $payment->paymentId,
    //             'date' => optional($date)->format('Y-m-d'),
    //             'clientName' => $clientName,
    //             'clientCedula' => $customer->documentNumber ?? '',
    //             'clientEmail' => $customer->emailCustomer ?? '',
    //             'clientPhone' => $customer->phoneCustomer ?? '',
    //             'description' => ($package->packageName ?? 'Sin paquete') . ' - ' . ($event->eventType ?? 'Sin evento'),
    //             'installment' => $installment,
    //             'installmentAmount' => $installmentAmount,
    //             'totalAmount' => (float) ($package->price ?? $payment->amount),
    //             'status' => $status,
    //             'dueDate' => $dueDate,
    //         ];
    //     });

    //     $payments->setCollection($collection);

    //     return response()->json([
    //         'data' => $payments->items(),
    //         'meta' => [
    //             'current_page' => $payments->currentPage(),
    //             'per_page' => $payments->perPage(),
    //             'total' => $payments->total(),
    //             'last_page' => $payments->lastPage(),
    //         ],
    //     ]);
    // }
}