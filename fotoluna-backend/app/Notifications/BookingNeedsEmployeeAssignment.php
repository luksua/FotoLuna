<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingNeedsEmployeeAssignment extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public Appointment $appointment
    ) {}

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nueva reserva pendiente de asignar')
            ->line('Hay una nueva reserva sin fotógrafo asignado.')
            ->line('Fecha: ' . $this->appointment->appointmentDate)
            ->line('Hora: ' . $this->appointment->appointmentTime);
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id'    => $this->booking->bookingId,
            'appointment_id'=> $this->appointment->appointmentId,
            'title'         => 'Reserva sin fotógrafo',
            'message'       => 'Asigna un fotógrafo a esta reserva.',
        ];
    }
}
