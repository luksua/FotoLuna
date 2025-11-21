<?php

// app/Http/Controllers/MercadoPagoController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Exceptions\MPApiException;
use App\Models\Booking;

MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

class MercadoPagoController extends Controller
{
    public function pay(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,bookingId',
            'transaction_amount' => 'required|numeric|min:0.01',
            'token' => 'required|string',  // token de la tarjeta que envía el front
            'installments' => 'required|integer|min:1', // cuotas
            'payment_method_id' => 'required|string',
            'payer' => 'required|array',
            'payer.email' => 'required|email',
        ]);

        $booking = Booking::findOrFail($data['booking_id']);

        MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));

        $client = new PaymentClient();

        try {
            $payment = $client->create([
                "transaction_amount" => (float) $data['transaction_amount'],
                "token" => $data['token'],
                "description" => "Pago de reserva #" . $booking->id,
                "installments" => $data['installments'],
                "payment_method_id" => $data['payment_method_id'],
                "payer" => [
                    "email" => $data['payer']['email'],
                ],
            ]);

            // Actualizar booking según estado
            if ($payment->status === 'approved') {
                $booking->status = 'paid'; // ajusta a tu lógica
                $booking->save();
            }

            return response()->json([
                'status' => $payment->status,
                'status_detail' => $payment->status_detail,
                'id' => $payment->id,
            ]);
        } catch (MPApiException $e) {
            return response()->json([
                'message' => 'Error al procesar el pago con Mercado Pago.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
