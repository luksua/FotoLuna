<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class BookingAssignedToEmployee extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public Appointment $appointment
    ) {
    }

    public function via($notifiable)
    {
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nueva cita asignada')
            ->line('Tienes una nueva sesión.')
            ->line('Fecha: ' . $this->appointment->appointmentDate)
            ->line('Hora: ' . $this->appointment->appointmentTime);
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id' => $this->booking->bookingId,
            'appointment_id' => $this->appointment->appointmentId,
            'title' => 'Nueva cita asignada',
            'message' => 'Tienes una nueva cita programada.',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}