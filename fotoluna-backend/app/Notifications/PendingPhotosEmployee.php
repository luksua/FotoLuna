<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PendingPhotosEmployee extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking     = $this->booking;
        $appointment = $booking->appointment;   // relación en el modelo Booking
        $customer    = $booking->customer;      // relación en el modelo Booking

        // Fecha bonita
        $date = \Carbon\Carbon::parse($appointment->appointmentDate)
            ->format('d/m/Y');

        // Nombre cliente (con fallback)
        $customerName = $customer
            ? trim($customer->firstNameCustomer . ' ' . $customer->lastNameCustomer)
            : 'el cliente';

        return [
            'type'            => 'employee.pending_photos',
            'title'           => 'Tienes fotos pendientes de entrega',
            'message'         => sprintf(
                'La sesión del %s con %s aún no tiene fotos entregadas.',
                $date,
                $customerName
            ),
            'booking_id'      => $booking->bookingId,
            'appointment_id'  => $appointment->appointmentId,
            'customer_id'     => $customer?->customerId,
            'employee_id'     => $booking->employeeIdFK,
            'status'          => $booking->bookingStatus,
            'priority'        => 'high',
            'icon'            => 'bi bi-folder2-open',

            // Si luego quieres usar booking_photos + estado, aquí puedes añadir:
            // 'pending_photos_count' => $booking->photos()->where('status', 'pending')->count(),
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
