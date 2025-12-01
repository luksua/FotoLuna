<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class LatePhotoDeliveryAdmin extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public ?\Carbon\Carbon $deadline = null
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking     = $this->booking;
        $appointment = $booking->appointment;
        $customer    = $appointment?->customer;
        $employee    = $booking->employee;

        $date = $appointment
            ? \Carbon\Carbon::parse($appointment->appointmentDate)->format('d/m/Y')
            : null;

        $customerName = trim(
            ($customer?->firstNameCustomer ?? '') . ' ' . ($customer?->lastNameCustomer ?? '')
        );
        if ($customerName === '') {
            $customerName = 'el cliente';
        }

        $employeeName = $employee
            ? trim($employee->firstNameEmployee . ' ' . $employee->lastNameEmployee)
            : 'Sin fotógrafo asignado';

        return [
            'type'           => 'admin.photos_sla_overdue',
            'title'          => 'Entrega de fotos atrasada',
            'message'        => sprintf(
                'La sesión del %s con %s aún no tiene fotos entregadas. Responsable: %s.',
                $date ?? 'N/A',
                $customerName,
                $employeeName
            ),
            'booking_id'     => $booking->bookingId,
            'appointment_id' => $appointment?->appointmentId,
            'customer_id'    => $customer?->customerId,
            'employee_id'    => $employee?->employeeId,
            'session_date'   => $appointment?->appointmentDate,
            'deadline'       => $this->deadline?->toDateString(),
            'priority'       => 'high',
            'icon'           => 'bi bi-clock-history',
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
