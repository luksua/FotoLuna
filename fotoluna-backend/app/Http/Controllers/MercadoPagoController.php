<?php

// app/Http/Controllers/MercadoPagoController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Exceptions\MPApiException;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

class MercadoPagoController extends Controller
{
    public function pay(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,bookingId',
            'transaction_amount' => 'required|numeric|min:0.01',
            'token' => 'required|string',
            'installments' => 'required|integer|min:1',
            'payment_method_id' => 'required|string',
            'payer' => 'required|array',
            'payer.email' => 'required|email',
            'installment_id' => 'nullable|integer|exists:booking_payment_installments,id',
        ]);

        $booking = Booking::with('installments')->findOrFail($data['booking_id']);

        MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
        $client = new PaymentClient();

        try {
            return DB::transaction(function () use ($client, $data, $booking) {
                $installmentId = $data['installment_id'] ?? null;

                $mpPayment = $client->create([
                    "transaction_amount" => (float) $data['transaction_amount'],
                    "token" => $data['token'],
                    "description" => "Pago de reserva #" . $booking->bookingId,
                    "installments" => $data['installments'],
                    "payment_method_id" => $data['payment_method_id'],
                    "payer" => [
                        "email" => $data['payer']['email'],
                    ],
                ]);

                // 1) Guardar registro local en payments (si tienes esta tabla)
                $localPayment = Payment::create([
                    'bookingIdFK' => $booking->bookingId,
                    'amount' => $data['transaction_amount'],
                    'paymentDate' => now(),
                    'paymentMethod' => $data['payment_method_id'],
                    'installments' => $data['installments'],
                    'mp_payment_id' => $mpPayment->id,
                    'paymentStatus' => $mpPayment->status,
                ]);

                // 2) Si se aprobó, aplicar el monto a las cuotas
                // 2) Si se aprobó, aplicar el monto a las cuotas
                if ($mpPayment->status === 'approved') {
                    $montoRestante = (float) $data['transaction_amount'];

                    $installmentsQuery = $booking->installments()
                        ->where('status', 'pending')
                        ->orderBy('due_date')
                        ->lockForUpdate();

                    if ($installmentId) {
                        // Forzar a que sea solo esa cuota
                        $installmentsQuery->where('id', $installmentId);
                    }

                    $installments = $installmentsQuery->get();

                    foreach ($installments as $ins) {
                        if ($montoRestante <= 0) {
                            break;
                        }

                        if ($montoRestante >= $ins->amount) {
                            // Se paga la cuota completa
                            $ins->status = 'paid';
                            $ins->paid_at = now();
                            $ins->paymentIdFK = $localPayment->paymentId ?? null;
                            $ins->save();

                            $montoRestante -= $ins->amount;
                        } else {
                            // Si quisieras manejar pagos parciales de una cuota, aquí iría la lógica
                            break;
                        }
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
    // public function pay(Request $request)
    // {
    //     $data = $request->validate([
    //         'booking_id' => 'required|integer|exists:bookings,bookingId',
    //         'transaction_amount' => 'required|numeric|min:0.01',
    //         'token' => 'required|string',  // token de la tarjeta que envía el front
    //         'installments' => 'required|integer|min:1', // cuotas
    //         'payment_method_id' => 'required|string',
    //         'payer' => 'required|array',
    //         'payer.email' => 'required|email',
    //     ]);

    //     $booking = Booking::findOrFail($data['booking_id']);

    //     MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

    //     $client = new PaymentClient();

    //     try {
    //         $payment = $client->create([
    //             "transaction_amount" => (float) $data['transaction_amount'],
    //             "token" => $data['token'],
    //             "description" => "Pago de reserva #" . $booking->id,
    //             "installments" => $data['installments'],
    //             "payment_method_id" => $data['payment_method_id'],
    //             "payer" => [
    //                 "email" => $data['payer']['email'],
    //             ],
    //         ]);

    //         // Actualizar booking según estado
    //         if ($payment->status === 'approved') {
    //             $booking->status = 'paid'; // ajusta a tu lógica
    //             $booking->save();
    //         }

    //         return response()->json([
    //             'status' => $payment->status,
    //             'status_detail' => $payment->status_detail,
    //             'id' => $payment->id,
    //         ]);
    //     } catch (MPApiException $e) {
    //         return response()->json([
    //             'message' => 'Error al procesar el pago con Mercado Pago.',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }
}
