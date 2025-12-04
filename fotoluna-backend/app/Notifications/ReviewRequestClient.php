<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ReviewRequestClient extends Notification
{
    public function __construct(
        public Booking $booking
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $employeeName = $this->booking->employee?->user?->name
            ?? $this->booking->employee?->employeeName
            ?? 'nuestro equipo';

        return [
            'type'        => 'review_request',
            'title'       => '¿Qué te pareció tu sesión?',
            'message'     => sprintf(
                'Tu opinión nos ayuda a mejorar. Califica tu experiencia con %s.',
                $employeeName
            ),
            'booking_id'  => $this->booking->bookingId ?? $this->booking->id ?? null,
            'priority'    => 'low',
            'icon'        => 'bi bi-star-fill',
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
