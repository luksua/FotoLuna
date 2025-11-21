<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;

class PaymentController extends Controller
{
    public function pay(Request $request)
    {
        try {
            // 1. Validar datos
            $validated = $request->validate([
                'booking_id' => 'required|exists:bookings,bookingId',
                'transaction_amount' => 'required|numeric|min:1',
                'payment_method_id' => 'required|string',
                'token' => 'required|string',
                'installments' => 'nullable|integer|min:1',
                'payer.email' => 'required|email',
                'client_payment_method' => 'nullable|string|in:Card,PSE',
            ]);

            // 2. Booking
            $booking = Booking::where('bookingId', $validated['booking_id'])->firstOrFail();

            // 3. SDK nuevo
            MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

            $client = new PaymentClient();

            // 4. Crear pago EN TRY para capturar exceptions
            try {
                $payment = $client->create([
                    'transaction_amount' => (float) $validated['transaction_amount'],
                    'token' => $validated['token'],
                    'installments' => $validated['installments'] ?? 1,
                    'payment_method_id' => $validated['payment_method_id'],
                    'payer' => [
                        'email' => $validated['payer']['email'],
                    ],
                ]);
            } catch (\Exception $mpError) {

                // 👉 ESTE ES EL ERROR REAL DE MERCADOPAGO
                return response()->json([
                    'message' => 'Error al comunicarse con Mercado Pago',
                    'mp_error' => $mpError->getMessage(),
                ], 422);
            }

            // Si Mercado Pago respondió con error interno
            if (isset($payment->error)) {
                return response()->json([
                    'message' => 'Mercado Pago rechazó la operación.',
                    'mp_error' => $payment->error,
                ], 422);
            }

            // 5. Registrar en payments
            $localPayment = Payment::create([
                'bookingIdFK' => $booking->bookingId,
                'amount' => $validated['transaction_amount'],
                'paymentDate' => now(),
                'paymentMethod' => $validated['client_payment_method'] ?? 'Card',
                'paymentStatus' => $payment->status,
                'installments' => $validated['installments'] ?? $payment->installments ?? null,
                'mp_payment_id' => $payment->id ?? null,
                'card_last_four' => $payment->card?->last_four_digits ?? null,
            ]);

            // 6. Actualizar Booking
            if ($payment->status === 'approved') {
                $booking->update(['bookingStatus' => 'Confirmed']);
            }

            return response()->json([
                'status' => $payment->status,
                'payment' => $localPayment,
                'mp_payment' => $payment,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error interno al procesar el pago.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



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
