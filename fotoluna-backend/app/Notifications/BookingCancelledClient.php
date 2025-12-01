<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingCancelledClient extends Notification
{
    public function __construct(
        public Booking $booking,
        public Appointment $appointment
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $date = $this->appointment->appointmentDate;
        $time = $this->appointment->appointmentTime;

        return [
            'type'           => 'booking_cancelled',
            'title'          => 'Tu reserva ha sido cancelada',
            'message'        => sprintf(
                'La sesión del %s a las %s ha sido cancelada. Si deseas reprogramar, contáctanos.',
                $date,
                $time
            ),
            'appointment_id' => $this->appointment->appointmentId ?? $this->appointment->id ?? null,
            'booking_id'     => $this->booking->bookingId ?? $this->booking->id ?? null,
            'status'         => $this->booking->bookingStatus,
            'priority'       => 'high',
            'icon'           => 'bi bi-x-octagon',
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