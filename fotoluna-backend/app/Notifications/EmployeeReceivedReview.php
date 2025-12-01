<?php

namespace App\Notifications;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class EmployeeReceivedReview extends Notification
{
    use Queueable;

    public function __construct(
        public Comment $comment
    ) {}

    public function via($notifiable): array
    {
        // Igual que el resto de tu sistema (BD + tiempo real)
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $comment = $this->comment;
        $user    = $comment->user;

        $clientName = $comment->is_anonymous
            ? 'Cliente anónimo'
            : ($user?->name ?? 'Cliente');

        return [
            'type'    => 'employee.review_received',
            'title'   => 'Has recibido una reseña',
            'message' => sprintf(
                '%s calificó su sesión contigo: %d/5. Comentario: "%s".',
                $clientName,
                $comment->rating,
                $comment->comment_text ?: 'Sin comentario'
            ),
            'comment_id'    => $comment->id,
            'rating'        => $comment->rating,
            'is_anonymous'  => (bool) $comment->is_anonymous,
            'user_id'       => $comment->user_id,
            'photographer_id' => $comment->photographer_id,
            'icon'          => 'bi bi-star-fill',
            'priority'      => 'medium',
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
