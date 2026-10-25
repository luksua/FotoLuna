/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { echo } from '../lib/echo';
import type { BackendNotification } from '../types/Notification';

// useNotifications.ts

interface UseNotificationsOptions {
    userId: number | null;
}

export function useNotifications({ userId }: UseNotificationsOptions) {
    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/notifications", {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Error al cargar notificaciones');

            const data = await res.json();
            // 👇 asumimos que "data" es un array con la forma de BackendNotification
            setNotifications(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const markAsRead = async (id: string) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('No se pudo marcar como leída');

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('No se pudo marcar todo como leído');

            const now = new Date().toISOString();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at ?? now }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!userId || !token) return;

        // 1) cargar notificaciones previas
        fetchNotifications();

        // 2) escuchar canal privado del usuario
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.listen(
            '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
            (event: any) => {
                const notification = event.notification as BackendNotification;
                setNotifications((prev) => [notification, ...prev]);
            }
        );

        return () => {
            echo.leave(`private-${channelName}`);
        };
    }, [userId, token, fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return {
        notifications,      // BackendNotification[]
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
    };
}
