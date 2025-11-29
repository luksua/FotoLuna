// src/components/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types/Notification';

interface NotificationBellProps {
  // por si quieres pasarle el nombre del usuario, rol, etc.
}

export const NotificationBell: React.FC<NotificationBellProps> = () => {
  const { notifications, unreadCount, loading, error, markAsRead } =
    useNotifications(30000); // 30s

  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);

  // cerrar el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    // aquí podrías redirigir a una página específica,
    // por ejemplo según booking_id, appointment_id, etc.
    // navigate(`/bookings/${notification.data.booking_id}`);
  };

  return (
    <div className="notification-bell-wrapper" ref={bellRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="notification-bell-btn"
        style={{
          position: 'relative',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '20px',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '999px',
              padding: '0 5px',
              fontSize: '10px',
              minWidth: '16px',
              textAlign: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '8px',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '4px 8px', borderBottom: '1px solid #eee' }}>
            <strong>Notificaciones</strong>
          </div>

          {loading && (
            <div style={{ padding: '8px', fontSize: '14px' }}>
              Cargando...
            </div>
          )}

          {error && (
            <div style={{ padding: '8px', fontSize: '12px', color: 'red' }}>
              {error}
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ padding: '8px', fontSize: '14px', color: '#666' }}>
              No tienes notificaciones.
            </div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: '8px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: n.read_at ? 'white' : '#f5f7ff',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {n.data.title}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                {n.data.message}
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                {/* aquí puedes formatear la fecha si quieres */}
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
