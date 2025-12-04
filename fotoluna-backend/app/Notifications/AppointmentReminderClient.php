<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class AppointmentReminderClient extends Notification
{
    use Queueable;

    public function __construct(
        public Appointment $appointment,
        public string $reminderType // 'week' | 'day'
    ) {}

    public function via($notifiable): array
    {
        // BD + tiempo real (Reverb/Echo)
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $date = $this->appointment->appointmentDate;
        $time = $this->appointment->appointmentTime;
        $place = $this->appointment->place ?? 'el lugar acordado';

        if ($this->reminderType === 'week') {
            $title   = 'Tu sesión se acerca';
            $message = sprintf(
                'Falta 1 semana para tu sesión el %s a las %s. Revisa lugar y tipo de sesión.',
                $date,
                $time
            );
        } else { // 'day'
            $title   = 'Mañana es tu sesión de fotos';
            $message = sprintf(
                'Nos vemos mañana a las %s en %s. Llega 10 minutos antes para alistarte.',
                $time,
                $place
            );
        }

        return [
            'type'           => 'appointment_reminder',
            'reminder_type'  => $this->reminderType, // 'week' o 'day'
            'title'          => $title,
            'message'        => $message,
            'appointment_id' => $this->appointment->appointmentId ?? $this->appointment->id ?? null,
            'status'         => $this->appointment->appointmentStatus ?? null,
            'priority'       => 'medium',
            'icon'           => 'bi bi-calendar-check',
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
