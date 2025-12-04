<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingUpdatedClient extends Notification
{
    public function __construct(
        public Booking $booking,
        public Appointment $appointment
    ) {}

    public function via($notifiable): array
    {
        // si luego quieres cola, puedes agregar ShouldQueue
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $date = $this->appointment->appointmentDate;
        $time = $this->appointment->appointmentTime;
        $place = $this->appointment->place ?? 'el lugar acordado';

        return [
            'type'           => 'booking_updated',
            'title'          => 'Actualización en tu reserva',
            'message'        => sprintf(
                'Tu sesión ahora es el %s a las %s en %s. Contactanos vía whatsapp o correo para cualquier duda.',
                $date,
                $time,
                $place
            ),
            'appointment_id' => $this->appointment->appointmentId ?? $this->appointment->id ?? null,
            'booking_id'     => $this->booking->bookingId ?? $this->booking->id ?? null,
            'status'         => $this->booking->bookingStatus,
            'priority'       => 'medium',
            'icon'           => 'bi bi-calendar-event',
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
