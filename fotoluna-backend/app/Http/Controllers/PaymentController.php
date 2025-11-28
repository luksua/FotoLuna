<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\StorageSubscription;
use App\Models\StoragePlan;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\BookingConfirmedMail;
use Illuminate\Support\Facades\Mail;
use App\Models\Employee;
use Illuminate\Support\Carbon;
class PaymentController extends Controller
{
    public function pay(Request $request)
    {
        try {
            $validated = $request->validate([
                'booking_id' => 'required|exists:bookings,bookingId',
                'transaction_amount' => 'required|numeric|min:1',
                'payment_method_id' => 'required|string',
                'token' => 'required|string',
                'installments' => 'nullable|integer|min:1',
                'payer.email' => 'required|email',
                'client_payment_method' => 'nullable|string|in:Card,PSE',
                'storage_plan_id' => 'nullable|exists:storage_plans,id',
            ]);

            $booking = Booking::where('bookingId', $validated['booking_id'])
                ->with(['package', 'documentType', 'appointment.customer'])
                ->firstOrFail();

            // Calcular total real de la reserva en backend
            $bookingTotal = 0;
            if ($booking->package) {
                $bookingTotal = $booking->package->price;
            } elseif ($booking->documentType) {
                $bookingTotal = $booking->documentType->price;
            }

            $storagePlan = null;
            $storagePlanPrice = 0;

            if (!empty($validated['storage_plan_id'])) {
                $storagePlan = StoragePlan::findOrFail($validated['storage_plan_id']);
                $storagePlanPrice = $storagePlan->price;
            }

            $expectedTotal = $bookingTotal + $storagePlanPrice;

            if ((float) $validated['transaction_amount'] !== (float) $expectedTotal) {
                return response()->json([
                    'message' => 'El monto enviado no coincide con el total calculado.',
                    'expected' => $expectedTotal,
                ], 422);
            }

            // Pagar con Mercado Pago (como ya lo tienes con PaymentClient)
            MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
            $client = new PaymentClient();

            $payment = $client->create([
                'transaction_amount' => (float) $validated['transaction_amount'],
                'token' => $validated['token'],
                'installments' => $validated['installments'] ?? 1,
                'payment_method_id' => $validated['payment_method_id'],
                'payer' => [
                    'email' => $validated['payer']['email'],
                ],
            ]);

            if ($payment->status === null) {
                return response()->json([
                    'message' => 'Error al procesar el pago con Mercado Pago.',
                ], 422);
            }

            // 3) Registrar Payment local
            $localPayment = Payment::create([
                'bookingIdFK' => $booking->bookingId,
                'amount' => $validated['transaction_amount'],
                'paymentDate' => now(),
                'paymentMethod' => $validated['client_payment_method'] ?? 'Card',
                'paymentStatus' => $payment->status,
                'installments' => $validated['installments'] ?? $payment->installments ?? null,
                'mp_payment_id' => $payment->id ?? null,
            ]);

            // 4) Si el pago está aprobado, confirmar booking y crear StorageSubscription
            if ($payment->status === 'approved') {
                $booking->update(['bookingStatus' => 'Confirmed']);

                $storageSubscription = null;

                if ($storagePlan) {
                    StorageSubscription::create([
                        'customerIdFK' => $booking->appointment->customerIdFK,
                        'plan_id' => $storagePlan->id,
                        'bookingIdFK' => $booking->bookingId,
                        'starts_at' => now(),
                        'ends_at' => now()->addMonths($storagePlan->duration_months),
                        'status' => 'active',
                        'payment_id' => $localPayment->id,
                        'mp_payment_id' => $payment->id ?? null,
                    ]);
                }

                //Cargar relaciones para el correo
                $booking->load([
                    'appointment.customer',
                    'appointment.event',
                    'package',
                    'documentType',
                    'photographer',
                    'payments' => fn($q) => $q->orderByDesc('paymentDate'),
                ]);

                $customer = $booking->appointment?->customer;

                if ($customer && $customer->emailCustomer) {
                    // El último pago (el que acabamos de registrar)
                    $lastPayment = $booking->payments->first() ?? $localPayment;

                    Mail::to($customer->emailCustomer)->send(
                        new BookingConfirmedMail(
                            $booking,
                            $storageSubscription,
                            $lastPayment
                        )
                    );
                }
            }

            return response()->json([
                'status' => $payment->status,
                'mp_payment' => [
                    'id' => $payment->id,
                    'status' => $payment->status,
                    'status_detail' => $payment->status_detail ?? null,
                ],
                'payment' => $localPayment,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error interno al procesar el pago.',
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
        // Usuario logueado (Sanctum / token)
        $user = $request->user();

        // Buscar empleado asociado al usuario
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        // Query base: pagos de bookings que pertenecen a ese empleado
        $query = Payment::with([
            'booking',
            'booking.appointment.customer',
            'booking.appointment.event',
            'booking.package',          // <-- usamos el paquete desde booking
            'booking.installments',
        ])
            ->whereHas('booking', function ($q) use ($employee) {
                $q->where('employeeIdFK', $employee->employeeId);
            });

        // --------- Filtros ---------

        // Estado: all | paid | pending | overdue
        $status = $request->query('status');
        if ($status && $status !== 'all') {
            if ($status === 'paid') {
                $query->whereIn('paymentStatus', ['approved', 'paid']);
            } else {
                $query->where('paymentStatus', $status);
            }
        }

        // Búsqueda por cliente / cédula / correo / teléfono
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

        // Rango de fechas (opcional)
        if ($from = $request->query('from_date')) {
            $query->whereDate('paymentDate', '>=', $from);
        }
        if ($to = $request->query('to_date')) {
            $query->whereDate('paymentDate', '<=', $to);
        }

        // Orden por fecha (más nuevo / más viejo)
        $order = strtolower($request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderByRaw('COALESCE(paymentDate, created_at) ' . $order);

        // Paginación
        $perPage = (int) $request->query('per_page', 5);
        $payments = $query->paginate($perPage);

        // Transformar datos para el frontend
        $collection = $payments->getCollection()->map(function (Payment $payment) {

            $booking = $payment->booking;
            $appointment = $booking?->appointment;
            $customer = $appointment?->customer;
            $event = $appointment?->event;
            $package = $booking?->package;              // <-- aquí solo booking->package
            $installments = $booking?->installments ?? collect();

            // Normalizar estado
            $status = $payment->paymentStatus;
            if ($status === 'approved') {
                $status = 'paid';
            }

            // Fecha
            $date = $payment->paymentDate ?? $payment->created_at;

            // Calcular cuotas
            if ($installments->count() > 1) {
                $sorted = $installments->sortBy('number');
                $current = $sorted->firstWhere('status', 'pending') ?? $sorted->last();

                $installment = [
                    'current' => (int) $current->number,
                    'total' => (int) $installments->count(),
                ];

                $installmentAmount = (float) $current->amount;
                $dueDate = optional($current->created_at)->format('Y-m-d');
            } else {
                $installment = [
                    'current' => 1,
                    'total' => 1,
                ];

                $installmentAmount = (float) $payment->amount;
                $dueDate = null;
            }

            // Datos de cliente
            $clientName = trim(
                ($customer->firstNameCustomer ?? '') . ' ' .
                ($customer->lastNameCustomer ?? '')
            );

            return [
                'id' => (int) $payment->paymentId,
                'date' => optional($date)->format('Y-m-d'),
                'clientName' => $clientName,
                'clientCedula' => $customer->documentNumber ?? '',
                'clientEmail' => $customer->emailCustomer ?? '',
                'clientPhone' => $customer->phoneCustomer ?? '',
                'description' => ($package->packageName ?? 'Sin paquete') . ' - ' . ($event->eventType ?? 'Sin evento'),
                'installment' => $installment,
                'installmentAmount' => $installmentAmount,
                'totalAmount' => (float) ($package->price ?? $payment->amount),
                'status' => $status,
                'dueDate' => $dueDate,
            ];
        });

        $payments->setCollection($collection);

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
                'last_page' => $payments->lastPage(),
            ],
        ]);
    }



}