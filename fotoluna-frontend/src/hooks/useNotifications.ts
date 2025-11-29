/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import type { Notification } from '../types/Notification';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export function useNotifications(pollIntervalMs: number = 30000) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('token');

    // 🔥 useCallback evita que la función cambie en cada render
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });

            if (!res.ok) {
                throw new Error('Error al cargar notificaciones');
            }

            const data = await res.json();
            setNotifications(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, [token]); // ← dependencia estable

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
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

    useEffect(() => {
        // primera carga
        fetchNotifications();

        // polling intervalo
        const interval = setInterval(fetchNotifications, pollIntervalMs);

        return () => clearInterval(interval);
    }, [fetchNotifications, pollIntervalMs]); // ← todo OK

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        refetch: fetchNotifications,
    };
}
