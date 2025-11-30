<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Lista notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return $user->notifications()
            ->whereNull('dismissed_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * POST /api/notifications/{id}/read
     * Marca una notificación como leída
     */
    public function markAsRead(Request $request, string $id)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->findOrFail($id);

        $notification->markAsRead();

        return response()->noContent();
    }

    /**
     * DELETE /api/notifications/{id}
     * Descarta / elimina una notificación
     */
    public function destroy(Request $request, string $id)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->findOrFail($id);

        // Opción A: marcar como descartada (si creaste dismissed_at)
        if ($notification->isFillable('dismissed_at') || array_key_exists('dismissed_at', $notification->getAttributes())) {
            $notification->update(['dismissed_at' => now()]);
        } else {
            // Opción B: eliminar de verdad
            $notification->delete();
        }

        return response()->noContent();
    }
}
