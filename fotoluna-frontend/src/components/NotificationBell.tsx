// NotificationBell.tsx
import React, { useState, useEffect, useRef } from "react";
import "./styles/noti.css";
import { useAuth } from "../context/useAuth";
import { useNotifications as useBackendNotifications } from "../hooks/useNotifications";
import type { BackendNotification, UiNotification } from "../types/Notification";

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const {
        notifications: backendNotifications,
        loading,
        error,
        markAsRead,
        markAllAsRead,
    } = useBackendNotifications({ userId });

    const [deletedNotifications, setDeletedNotifications] = useState<UiNotification[]>([]);
    const [selected, setSelected] = useState<UiNotification | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "week" | "older">("today");
    const [showPanel, setShowPanel] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const getNotificationIcon = (title: string, message: string, rawIcon?: string) => {
        if (rawIcon && rawIcon !== "bi bi-bell") return rawIcon;
        const text = `${title} ${message}`.toLowerCase();
        if (text.includes("fotógrafo") || text.includes("fotografo")) return "bi bi-camera-fill";
        if (text.includes("cita") || text.includes("sesión") || text.includes("sesion") || text.includes("reserva")) return "bi bi-calendar2-check-fill";
        if (text.includes("pago") || text.includes("abono") || text.includes("tarjeta")) return "bi bi-credit-card-fill";
        if (text.includes("foto") || text.includes("imagen") || text.includes("galería")) return "bi bi-images";
        if (text.includes("confirmad") || text.includes("aprobad")) return "bi bi-check-circle-fill";
        return "bi bi-bell-fill";
    };

    const mapBackendToUI = (n: BackendNotification): UiNotification => {
        const created = n?.created_at ? new Date(n.created_at) : new Date();
        const now = new Date();

        const diffMs = now.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        let category: UiNotification["category"];

        if (n?.read_at) {
            category = "older";
        } else {
            if (diffDays < 1) category = "today";
            else if (diffDays < 7) category = "week";
            else category = "older";
        }

        const dateLabel = created.toLocaleString("es-CO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

        // Soporta tanto formato anidado (n.data) como formato plano
        const notifData = n?.data || (n as any) || {};
        const priority: UiNotification["priority"] =
            notifData.priority ?? (n as any)?.priority ?? "medium";
        const title = notifData.title ?? (n as any)?.title ?? "Notificación";
        const message = notifData.message ?? (n as any)?.message ?? "";
        const icon = getNotificationIcon(title, message, notifData.icon ?? (n as any)?.icon);

        return {
            id: String(n?.id ?? Math.random()),
            title,
            message,
            read: n?.read_at !== null && n?.read_at !== undefined,
            priority,
            date: dateLabel,
            category,
            icon,
        };
    };

    const uiNotifications: UiNotification[] = (backendNotifications || [])
        .filter(Boolean)
        .map(mapBackendToUI)
        .filter((n) => !deletedNotifications.find((d) => d.id === n.id));

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case "high":
                return "priority-high";
            case "medium":
                return "priority-medium";
            case "low":
                return "priority-low";
            default:
                return "priority-medium";
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case "high":
                return "Alta";
            case "medium":
                return "Media";
            case "low":
                return "Baja";
            default:
                return priority;
        }
    };

    const handleOpen = (notif: UiNotification) => {
        setSelected(notif);
        if (!notif.read) {
            markAsRead(notif.id);
        }
    };

    const handleClosePanel = () => setShowPanel(false);
    const handleCloseModal = () => setSelected(null);

    const handleMarkAllRead = async () => {
        try {
            setMarkingAll(true);
            await markAllAsRead();
        } finally {
            setMarkingAll(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok && res.status !== 204) {
                console.error("No se pudo descartar la notificación");
            }

            const toDelete = uiNotifications.find((n) => n.id === id);
            if (!toDelete) return;

            const moved: UiNotification = {
                ...toDelete,
                category: "older",
                read: true,
            };

            setDeletedNotifications((prev) => [moved, ...prev]);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNotifications =
        activeTab === "older"
            ? [
                ...uiNotifications.filter((notif) => notif.category === "older"),
                ...deletedNotifications,
            ]
            : uiNotifications.filter((notif) => notif.category === activeTab);

    const unreadCount = uiNotifications.filter((notif) => !notif.read).length;

    const todayUnread = uiNotifications.filter((n) => n.category === "today" && !n.read).length;
    const weekUnread = uiNotifications.filter((n) => n.category === "week" && !n.read).length;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (selected) return;

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setShowPanel(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selected]);

    if (!userId) return null;

    return (
        <>
            <div className="notification-bell-wrapper" ref={wrapperRef}>
                <button
                    type="button"
                    className={`notification-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => setShowPanel((prev) => !prev)}
                    aria-label="Notificaciones"
                    title={unreadCount > 0 ? `${unreadCount} notificaciones no leídas` : "Notificaciones"}
                >
                    <i className="bi bi-bell-fill"></i>
                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>

                {showPanel && (
                    <div
                        className="notifications-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="notifications-header">
                            <div className="header-title-row">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="header-icon-badge">
                                        <i className="bi bi-bell-fill"></i>
                                    </div>
                                    <h3 className="panel-title">Notificaciones</h3>
                                </div>
                                <button
                                    className="btn-close-panel"
                                    onClick={handleClosePanel}
                                    title="Cerrar panel"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <div className="header-actions-row">
                                {unreadCount > 0 ? (
                                    <span className="unread-counter-badge">
                                        <span className="dot"></span>
                                        {unreadCount} {unreadCount === 1 ? "no leída" : "no leídas"}
                                    </span>
                                ) : (
                                    <span className="all-read-badge">
                                        <i className="bi bi-check-circle-fill me-1"></i> Todo al día
                                    </span>
                                )}

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn-mark-all"
                                        onClick={handleMarkAllRead}
                                        disabled={markingAll}
                                        title="Marcar todas como leídas"
                                    >
                                        <i className="bi bi-check2-all me-1"></i>
                                        {markingAll ? "Marcando..." : "Marcar todo leído"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="notifications-tabs-wrapper">
                            <div className="notifications-tabs">
                                <button
                                    className={`tab ${activeTab === "today" ? "active" : ""}`}
                                    onClick={() => setActiveTab("today")}
                                >
                                    Hoy
                                    {todayUnread > 0 && (
                                        <span className="tab-pill">{todayUnread}</span>
                                    )}
                                </button>
                                <button
                                    className={`tab ${activeTab === "week" ? "active" : ""}`}
                                    onClick={() => setActiveTab("week")}
                                >
                                    Esta semana
                                    {weekUnread > 0 && (
                                        <span className="tab-pill">{weekUnread}</span>
                                    )}
                                </button>
                                <button
                                    className={`tab ${activeTab === "older" ? "active" : ""}`}
                                    onClick={() => setActiveTab("older")}
                                >
                                    Anteriores
                                </button>
                            </div>
                        </div>

                        {/* Lista */}
                        <div className="notifications-list-container">
                            {loading && (
                                <div className="empty-state">
                                    <div className="empty-icon-wrap loading-spinner">
                                        <i className="bi bi-arrow-repeat"></i>
                                    </div>
                                    <h4>Cargando notificaciones...</h4>
                                    <p>Por favor espera un momento</p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="empty-state">
                                    <div className="empty-icon-wrap error-icon">
                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                    </div>
                                    <h4>Error al cargar</h4>
                                    <p>{error}</p>
                                </div>
                            )}

                            {!loading && !error && filteredNotifications.length > 0 ? (
                                <div className="notifications-list">
                                    {filteredNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${getPriorityClass(
                                                notif.priority
                                            )} ${notif.read ? "read" : "unread"}`}
                                            onClick={() => handleOpen(notif)}
                                        >
                                            <div className="notification-icon-wrap">
                                                <i className={notif.icon}></i>
                                            </div>

                                            <div className="notification-content">
                                                <div className="notification-main">
                                                    <h5 className="notification-title">
                                                        {notif.title}
                                                        {deletedNotifications.some(
                                                            (d) => d.id === notif.id
                                                        ) && (
                                                            <span className="deleted-tag"> (eliminada)</span>
                                                        )}
                                                    </h5>
                                                    <p className="notification-preview">
                                                        {notif.message}
                                                    </p>
                                                </div>

                                                <div className="notification-meta">
                                                    <span className={`priority-badge priority-${notif.priority}`}>
                                                        <span className="priority-dot"></span>
                                                        {getPriorityText(notif.priority)}
                                                    </span>
                                                    <span className="notification-date">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {notif.date}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="notification-actions">
                                                {!notif.read && <div className="unread-dot" title="No leída" />}
                                                {!deletedNotifications.find(
                                                    (d) => d.id === notif.id
                                                ) && (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={(e) => handleDelete(notif.id, e)}
                                                        title="Eliminar notificación"
                                                    >
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !loading &&
                                !error && (
                                    <div className="empty-state">
                                        <div className="empty-icon-wrap">
                                            <i className="bi bi-bell-slash"></i>
                                        </div>
                                        <h4>¡Todo está al día!</h4>
                                        <p>No tienes notificaciones en esta sección</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {selected && (
                <div
                    className="notification-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="notification-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header-custom">
                            <div className="modal-icon-bubble">
                                <i className={selected.icon}></i>
                            </div>
                            <div className="modal-title-wrap">
                                <h4>{selected.title}</h4>
                                <div className="modal-meta-row">
                                    <span className={`priority-badge priority-${selected.priority}`}>
                                        <span className="priority-dot"></span>
                                        {getPriorityText(selected.priority)}
                                    </span>
                                    <span className="modal-date">
                                        <i className="bi bi-clock me-1"></i>
                                        {selected.date}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="btn-close-modal"
                                onClick={handleCloseModal}
                                title="Cerrar"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="modal-body-custom">
                            <p>{selected.message}</p>
                        </div>

                        <div className="modal-footer-custom">
                            <button
                                className="btn-modal-close"
                                onClick={handleCloseModal}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;
