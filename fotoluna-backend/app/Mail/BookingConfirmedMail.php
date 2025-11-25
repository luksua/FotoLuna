<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\StorageSubscription;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class BookingConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;
    public ?StorageSubscription $storageSubscription;
    public ?Payment $lastPayment;

    public function __construct(
        Booking $booking,
        ?StorageSubscription $storageSubscription,
        ?Payment $lastPayment
    ) {
        $this->booking             = $booking;
        $this->storageSubscription = $storageSubscription;
        $this->lastPayment         = $lastPayment;
    }

    public function build()
    {
        $mail = $this->subject('Confirmación de tu sesión en FotoLuna')
            ->markdown('emails.confirmed', [
                'booking'             => $this->booking,
                'storageSubscription' => $this->storageSubscription,
                'lastPayment'         => $this->lastPayment,
            ]);

        $pdf = Pdf::loadView('pdf.booking_receipt', [
            'booking'             => $this->booking,
            'storageSubscription' => $this->storageSubscription,
            'lastPayment'         => $this->lastPayment,
        ]);

        return $mail->attachData(
            $pdf->output(),
            'recibo-FL-'.$this->booking->bookingId.'.pdf',
            ['mime' => 'application/pdf']
        );
    }
}
