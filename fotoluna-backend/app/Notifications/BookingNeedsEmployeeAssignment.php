<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingNeedsEmployeeAssignment extends Notification
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
        $package     = $booking->package;
        $document    = $booking->documentType;

        $date = optional($appointment)->appointmentDate;
        $time = optional($appointment)->appointmentTime;

        $dateFormatted = $date
            ? \Carbon\Carbon::parse($date)->format('d/m/Y')
            : null;

        $timeFormatted = $time
            ? \Carbon\Carbon::parse($time)->format('H:i')
            : null;

        $clientName = trim(
            ($customer?->firstNameCustomer ?? '') . ' ' . ($customer?->lastNameCustomer ?? '')
        );

        if ($clientName === '') {
            $clientName = 'cliente sin nombre';
        }

        $serviceName = $package?->packageName
            ?? $document?->name
            ?? 'sesión fotográfica';

        return [
            'type'           => 'admin.booking_needs_employee',
            'title'          => 'Reserva sin fotógrafo asignado',
            'message'        => sprintf(
                'La reserva #%d de %s (%s) para el %s a las %s no tiene fotógrafo asignado. Asigna uno lo antes posible.',
                $booking->bookingId,
                $clientName,
                $serviceName,
                $dateFormatted ?? $date ?? 'fecha por definir',
                $timeFormatted ?? $time ?? 'hora por definir'
            ),
            'booking_id'     => $booking->bookingId,
            'appointment_id' => $appointment?->appointmentId,
            'customer_id'    => $customer?->customerId,
            'status'         => $booking->bookingStatus,
            'priority'       => 'high',
            'icon'           => 'bi bi-person-badge',
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
