<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OverdueInstallmentsAdmin extends Notification
{
    use Queueable;

    public function __construct(
        public int $bookingsCount,      // cuántas reservas distintas tienen cuotas vencidas
        public int $installmentsCount   // cuántas cuotas vencidas en total
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type'               => 'admin.overdue_installments',
            'title'              => 'Pagos vencidos',
            'message'            => sprintf(
                'Hay %d reservas con un total de %d cuotas vencidas. Revisa cobros y comunicación con clientes.',
                $this->bookingsCount,
                $this->installmentsCount
            ),
            'bookings_count'     => $this->bookingsCount,
            'installments_count' => $this->installmentsCount,
            'priority'           => 'high',
            'icon'               => 'bi bi-exclamation-circle',
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
