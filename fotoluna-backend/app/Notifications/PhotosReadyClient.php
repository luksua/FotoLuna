<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PhotosReadyClient extends Notification
{
    use Queueable;

    public function __construct(
        public Booking $booking
    ) {}

    public function via($notifiable): array
    {
        // database = para tu /api/notifications
        // broadcast = para Reverb/Echo en tiempo real
        return ['database', 'broadcast'];
    }

    /**
     * Lo que se guarda en la BD (y tu front consume en data.*)
     */
    public function toDatabase($notifiable): array
    {
        $appointment = $this->booking->appointment;

        return [
            'type'          => 'photos_ready',
            'title'         => '¡Tus fotos están listas!',
            'message'       => sprintf(
                'Ya puedes ver tus fotos de la sesión del %s.',
                optional($appointment)->appointmentDate ?? 'día asignado'
            ),
            'booking_id'    => $this->booking->bookingId ?? $this->booking->id ?? null,
            'appointment_id'=> optional($appointment)->appointmentId ?? null,
            'status'        => $this->booking->bookingStatus ?? 'Completed',
            'priority'      => 'medium',
            'icon'          => 'bi bi-images',
        ];
    }

    /**
     * Lo que se emite por broadcast (Reverb)
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id'   => $this->id,
            'data' => $this->toDatabase($notifiable),
        ]);
    }

    public function toArray($notifiable): array
    {
        // Laravel usa esto como base para broadcast también
        return $this->toDatabase($notifiable);
    }
}
