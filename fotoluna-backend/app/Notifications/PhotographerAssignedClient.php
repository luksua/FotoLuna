<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PhotographerAssignedClient extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $appointment = $this->booking->appointment;
        $customer    = $appointment?->customer;
        $photographer = $this->booking->employee;

        return [
            'type'       => 'client.photographer_assigned',
            'title'      => 'Tu fotógrafo ha sido asignado',
            'message'    => sprintf(
                'Hola %s, tu sesión del %s tiene ahora como fotógrafo a %s %s.',
                $customer?->firstNameCustomer ?? 'Cliente',
                $appointment?->appointmentDate,
                $photographer?->firstNameEmployee,
                $photographer?->lastNameEmployee
            ),
            'booking_id' => $this->booking->bookingId,
            'employee_id'=> $photographer?->employeeId,
            'priority'   => 'medium',
            'icon'       => 'bi bi-camera',
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
