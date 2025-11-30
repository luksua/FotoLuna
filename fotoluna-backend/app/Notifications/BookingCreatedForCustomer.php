<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Models\Appointment;

class BookingCreatedForCustomer extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Booking $booking,
        public Appointment $appointment
    ) {
    }

    public function via($notifiable)
    {
        return ['database']; // o solo ['database']
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Tu reserva fue creada')
            ->line('Tu reserva ha sido creada correctamente.')
            ->line('Estado: ' . $this->booking->bookingStatus)
            ->line('ID de reserva: ' . $this->booking->bookingId);
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id' => $this->booking->bookingId,
            'status' => $this->booking->bookingStatus,
            'title' => 'Reserva creada',
            'message' => 'Tu reserva fue creada con éxito.',
        ];
    }
}
