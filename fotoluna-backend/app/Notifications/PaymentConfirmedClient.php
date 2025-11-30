<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Support\Collection;

class PaymentConfirmedClient extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public Payment $payment,
        public Collection $installments // Collection<BookingPaymentInstallment>
    ) {}

    public function via($notifiable): array
    {
        // BD + tiempo real
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking      = $this->booking;
        $payment      = $this->payment;
        $installments = $this->installments;

        return [
            'type'           => 'payment_completed',
            'title'          => 'Pago recibido',
            'message'        => sprintf(
                'Hemos recibido tu pago de $%s por la sesión %s.',
                number_format($payment->amount, 0, ',', '.'),
                optional($booking->package)->name ?? 'fotográfica'
            ),
            'booking_id'     => $booking->bookingId,
            'payment_id'     => $payment->paymentId ?? $payment->id ?? null,
            'installment_ids'=> $installments->pluck('id')->all(),
            'status'         => $booking->bookingStatus,
            'priority'       => 'high',
            'icon'           => 'bi bi-credit-card',
        ];
    }
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id'   => $this->id,
            'data' => $this->toDatabase($notifiable),
        ]);
    }

    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
