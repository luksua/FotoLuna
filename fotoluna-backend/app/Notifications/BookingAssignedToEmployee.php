<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingAssignedToEmployee extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking
    ) {
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking = $this->booking;
        $appointment = $booking->appointment;
        $customer = $booking->customer;
        $event = $booking->event;

        $date = \Carbon\Carbon::parse($appointment->appointmentDate)
            ->format('d/m/Y');

        return [
            'type' => 'employee.booking_assigned',
            'title' => 'Nueva sesión asignada',
            'message' => sprintf(
                'Se te ha asignado la reserva #%s. Revisa tu agenda.',
                $booking->bookingId
            ),
            'booking_id' => $booking->bookingId,
            'status' => $booking->bookingStatus ?? null,
            'priority' => 'high',
            'icon' => 'bi bi-calendar-plus',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'data' => $this->toDatabase($notifiable),
        ]);
    }

    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
