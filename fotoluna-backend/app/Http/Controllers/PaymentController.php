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
}
