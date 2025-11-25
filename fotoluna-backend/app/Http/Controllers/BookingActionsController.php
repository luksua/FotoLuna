<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\StorageSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\BookingConfirmedMail;

class BookingActionsController extends Controller
{
    /**
     * POST /api/bookings/{booking}/send-confirmation
     */
    public function sendConfirmation(Booking $booking)
    {
        $booking->load([
            'appointment.customer',
            'appointment.event',   // el evento viene por appointment
            'package',
            'documentType',
            'photographer',
            'payments' => fn($q) => $q->orderByDesc('paymentDate'),
        ]);

        $appointment = $booking->appointment;
        $customer = $appointment?->customer;

        if (!$customer || !$customer->emailCustomer) {
            return response()->json([
                'message' => 'No se encontró el email del cliente para esta reserva.',
            ], 422);
        }

        $lastPayment = $booking->payments->first();

        // si usas StorageSubscription por booking:
        $storageSubscription = StorageSubscription::where('bookingIdFK', $booking->bookingId)
            ->latest()
            ->first();

        Mail::to($customer->emailCustomer)
            ->send(new BookingConfirmedMail(
                $booking,
                $storageSubscription,
                $lastPayment
            ));

        return response()->json([
            'message' => 'Correo de confirmación enviado correctamente.',
        ]);
    }

    /**
     * GET /api/bookings/{booking}/calendar-link
     * Devuelve la URL de Google Calendar
     */
    public function calendarLink(Booking $booking)
    {
        $booking->load(['appointment', 'appointment.event', 'package']);

        $appointment = $booking->appointment;

        if (!$appointment) {
            return response()->json([
                'message' => 'La reserva no tiene una cita asociada.'
            ], 422);
        }

        // Datos del calendario
        $title = $booking->appointment?->event?->eventType
            ?? $booking->package?->packageName
            ?? 'Sesión fotográfica';

        $date = $appointment->appointmentDate;
        $time = $appointment->appointmentTime;
        $endTime = \Carbon\Carbon::parse($time)->addHour()->format('H:i:s');

        $start = \Carbon\Carbon::parse("$date $time")->format('Ymd\THis');
        $end = \Carbon\Carbon::parse("$date $endTime")->format('Ymd\THis');

        $location = $appointment->place ?? 'FotoLuna Studio';

        $details = urlencode("Tu sesión ha sido reservada. Booking ID: FL-" . $booking->bookingId);

        // Crear enlace
        $googleUrl =
            "https://calendar.google.com/calendar/render?action=TEMPLATE" .
            "&text=" . urlencode($title) .
            "&dates={$start}/{$end}" .
            "&details={$details}" .
            "&location=" . urlencode($location);

        return response()->json([
            'url' => $googleUrl
        ]);
    }


    /**
     * GET /api/bookings/{booking}/receipt
     * Descarga un PDF con el recibo
     */
    public function receipt(Booking $booking)
    {
        $booking->load([
            'appointment.customer',
            'appointment.event',     // 👈 AQUÍ en vez de 'event'
            'package',
            'documentType',
            'photographer',
            'payments' => fn($q) => $q->orderByDesc('paymentDate'),
        ]);

        $lastPayment = $booking->payments->first();

        $storageSubscription = StorageSubscription::where('bookingIdFK', $booking->bookingId)
            ->latest()
            ->first();

        $pdf = Pdf::loadView('pdf.booking_receipt', [
            'booking' => $booking,
            'lastPayment' => $lastPayment,
            'storageSubscription' => $storageSubscription,
        ]);

        $fileName = 'recibo-FL-' . $booking->bookingId . '.pdf';

        return $pdf->download($fileName);
    }

    // private function sendBookingConfirmationEmail(Booking $booking, ?Payment $payment = null): void
    // {
    //     // Cargar relaciones necesarias
    //     $booking->load([
    //         'appointment.customer',
    //         'appointment.event',
    //         'package',
    //         'documentType',
    //         'photographer',
    //         'payments' => fn($q) => $q->orderByDesc('paymentDate'),
    //     ]);

    //     $appointment = $booking->appointment;
    //     $customer    = $appointment?->customer;

    //     if (!$customer || !$customer->emailCustomer) {
    //         // Si no hay email, no hacemos nada (o podrías loguear esto)
    //         \Log::warning('No email for booking confirmation', [
    //             'bookingId' => $booking->bookingId,
    //         ]);
    //         return;
    //     }

    //     // Si no pasamos payment, tomamos el último
    //     $lastPayment = $payment ?: $booking->payments->first();

    //     // Plan de almacenamiento (si existe)
    //     $storageSubscription = StorageSubscription::where('bookingIdFK', $booking->bookingId)
    //         ->latest()
    //         ->first();

    //     Mail::to($customer->emailCustomer)
    //         ->send(new BookingConfirmedMail(
    //             $booking,
    //             $storageSubscription,
    //             $lastPayment
    //         ));
    // }
}
