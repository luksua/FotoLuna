<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InstallmentDueSoonClient extends Notification
{
    use Queueable;

    public function __construct(
        public $installment,
        public $booking,
        public $dueDate,
        public $amount
    ) {}

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'type'     => 'installment_due_soon',
            'title'    => 'Tu pago está por vencer',
            'message'  => sprintf(
                'Tienes una cuota de %s con vencimiento el %s para tu sesión #%d.',
                number_format($this->amount, 0, ',', '.'),
                $this->dueDate->format('d/m/Y'),
                $this->booking->bookingId ?? $this->booking->id ?? 0
            ),
            'priority' => 'high',
            'icon'     => 'bi bi-credit-card', // o el que estés usando
        ];
    }
}
