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
            'appointment.event',
            'package',
            'documentType',
            'photographer',
            'payments' => fn($q) => $q->orderByDesc('paymentDate'),
            'installments', // 👈 importante
        ]);

        $lastPayment = $booking->payments->first();

        // Total del servicio: suma de cuotas, o paquete/documento como fallback
        $totalFromInstallments = $booking->installments->sum('amount');

        $totalService = $totalFromInstallments > 0
            ? $totalFromInstallments
            : (
                optional($booking->package)->price
                ?? optional($booking->documentType)->price
                ?? 0
            );

        // Total pagado: suma de cuotas con estado "paid"
        $totalPaid = $booking->installments
            ->where('status', 'paid')
            ->sum('amount');

        $customer = $booking->appointment?->customer;

        $pdf = Pdf::loadView('pdf.booking_receipt', [
            'booking' => $booking,
            'customer' => $customer,
            'lastPayment' => $lastPayment,
            'totalService' => $totalService,
            'totalPaid' => $totalPaid,
        ]);

        $fileName = 'recibo-FL-' . $booking->bookingId . '.pdf';

        return $pdf->download($fileName);
    }

    /**
     * GET /api/appointments/{appointment}/installments/{installment}/receipt
     * Recibo PDF de una cuota específica
     */

    public function installmentReceipt($appointmentId, $installmentId)
    {
        // 1) Buscar la reserva ligada a esa cita
        $booking = Booking::whereHas('appointment', function ($q) use ($appointmentId) {
            $q->where('appointmentId', $appointmentId);
        })
            ->with(['appointment.customer', 'installments'])
            ->first(); // 👈 OJO: sin OrFail

        if (!$booking) {
            dd([
                'error' => 'No se encontró booking para esa appointment',
                'appointmentId_param' => $appointmentId,
            ]);
        }

        // 2) Ver qué cuotas tiene ese booking
        $availableInstallments = $booking->installments->pluck('id');

        $installment = $booking->installments
            ->where('id', $installmentId)
            ->first(); // 👈 sin OrFail

        if (!$installment) {
            dd([
                'error' => 'No se encontró installment para ese booking',
                'bookingId' => $booking->bookingId ?? $booking->id,
                'requested_installment_id' => $installmentId,
                'available_installments' => $availableInstallments,
            ]);
        }

        $customer = $booking->appointment->customer ?? null;
        $lastPayment = null;

        $pdf = Pdf::loadView('pdf.installment_receipt', [
            'booking' => $booking,
            'installment' => $installment,
            'customer' => $customer,
            'lastPayment' => $lastPayment,
        ]);

        $fileName = 'recibo-cuota-' . $installment->id . '-FL-' . $booking->bookingId . '.pdf';

        return $pdf->download($fileName);
    }

    // public function installmentReceipt($appointmentId, $installmentId)
    // {
    //     $booking = Booking::whereHas('appointment', function ($q) use ($appointmentId) {
    //         $q->where('appointmentId', $appointmentId);
    //     })
    //         ->with(['appointment.customer'])
    //         ->firstOrFail();

    //     $installment = $booking->installments()
    //         ->where('id', $installmentId)
    //         ->firstOrFail();

    //     $customer = $booking->appointment->customer ?? null;

    //     // Si tienes algún log de pagos asociado a la cuota, podrías sacarlo aquí.
    //     $lastPayment = null; // o lo que corresponda

    //     $pdf = Pdf::loadView('pdf.installment_receipt', [
    //         'booking' => $booking,
    //         'installment' => $installment,
    //         'customer' => $customer,
    //         'lastPayment' => $lastPayment,
    //     ]);

    //     $fileName = 'recibo-cuota-' . $installment->id . '-FL-' . $booking->bookingId . '.pdf';

    //     return $pdf->download($fileName);
    // }

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
