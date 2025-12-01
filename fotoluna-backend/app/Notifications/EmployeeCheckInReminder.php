<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class EmployeeCheckInReminder extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking
    ) {}

    public function via($notifiable): array
    {
        // BD + tiempo real
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking     = $this->booking;
        $appointment = $booking->appointment;
        $customer    = $booking->customer ?? $appointment?->customer;

        $date = optional($appointment)->appointmentDate;
        $time = optional($appointment)->appointmentTime;

        $dateFormatted = $date
            ? \Carbon\Carbon::parse($date)->format('d/m/Y')
            : null;

        $clientName = trim(
            ($customer?->firstNameCustomer ?? '') . ' ' . ($customer?->lastNameCustomer ?? '')
        );

        if ($clientName === '') {
            $clientName = 'el cliente';
        }

        return [
            'type'           => 'employee.check_in_reminder',
            'title'          => 'Prepara tu sesión',
            'message'        => sprintf(
                'La sesión con %s empieza en 30 minutos. Verifica equipo y locación.',
                $clientName
            ),
            'booking_id'     => $booking->bookingId,
            'appointment_id' => $appointment?->appointmentId,
            'customer_id'    => $customer?->customerId,
            'employee_id'    => $booking->employeeIdFK,
            'date'           => $date,
            'time'           => $time,
            'priority'       => 'medium',
            'icon'           => 'bi bi-alarm',
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
