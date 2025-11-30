// NotificationBell.tsx
import React, { useState, useEffect, useRef } from "react";
import "./styles/noti.css";
import { useAuth } from "../context/useAuth";

import { useNotifications as useBackendNotifications } from "../hooks/useNotifications";
import type { BackendNotification, UiNotification } from "../types/Notification";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const {
        notifications: backendNotifications,
        loading,
        error,
        markAsRead, // este ya debería estar llamando a POST /notifications/{id}/read
    } = useBackendNotifications({ userId });

    const [deletedNotifications, setDeletedNotifications] = useState<UiNotification[]>([]);
    const [selected, setSelected] = useState<UiNotification | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "week" | "older">("today");
    const [showPanel, setShowPanel] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const mapBackendToUI = (n: BackendNotification): UiNotification => {
        const created = new Date(n.created_at);
        const now = new Date();

        const diffMs = now.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        let category: UiNotification["category"];

        if (n.read_at) {
            // LEÍDA → siempre va a "anteriores"
            category = "older";
        } else {
            // NO LEÍDA → se clasifica por fecha
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

        const priority: UiNotification["priority"] = n.data.priority ?? "medium";
        const icon = n.data.icon ?? "bi bi-bell";

        return {
            id: n.id,
            title: n.data.title ?? "Notificación",
            message: n.data.message ?? "",
            read: n.read_at !== null,
            priority,
            date: dateLabel,
            category,
            icon,
        };
    };

    const uiNotifications: UiNotification[] = backendNotifications
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
                return "";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "#E8B4D9";
            case "medium":
                return "#D4A5E9";
            case "low":
                return "#C8B6FF";
            default:
                return "#B8B5FF";
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

    // 👉 Abrir: solo marcar como leída (controlador markAsRead)
    const handleOpen = (notif: UiNotification) => {
        setSelected(notif);

        if (!notif.read) {
            markAsRead(notif.id); // POST /notifications/{id}/read
        }
    };

    const handleClosePanel = () => setShowPanel(false);
    const handleCloseModal = () => setSelected(null);

    // 👉 Eliminar: hablar con controlador (DELETE /notifications/{id})
    const handleDelete = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_URL}/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok && res.status !== 204) {
                console.error("No se pudo descartar la notificación");
            }

            // Actualizar estado local: la quitamos de la UI
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

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            // Si hay modal abierto, NO cerrar el panel
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
                    className="notification-btn"
                    onClick={() => setShowPanel((prev) => !prev)}
                    aria-label="Notificaciones"
                >
                    <i className="bi bi-bell-fill"></i>
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>

                {showPanel && (
                    <div
                        className="notifications-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="notifications-header">
                            <div className="header-content">
                                <h2>Notificaciones</h2>
                                <div className="header-actions">
                                    {activeTab !== "older" && unreadCount > 0 && (
                                        <span className="unread-count">
                                            {unreadCount} no leídas
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="btn-close-panel"
                                    onClick={handleClosePanel}
                                    title="Cerrar panel"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="notifications-tabs">
                            <button
                                className={`tab ${activeTab === "today" ? "active" : ""}`}
                                onClick={() => setActiveTab("today")}
                            >
                                Hoy
                            </button>
                            <button
                                className={`tab ${activeTab === "week" ? "active" : ""}`}
                                onClick={() => setActiveTab("week")}
                            >
                                Esta semana
                            </button>
                            <button
                                className={`tab ${activeTab === "older" ? "active" : ""}`}
                                onClick={() => setActiveTab("older")}
                            >
                                Anteriores
                            </button>
                        </div>

                        {/* Lista */}
                        <div className="notifications-list-container">
                            {loading && (
                                <div className="empty-state">
                                    <i className="bi bi-hourglass-split"></i>
                                    <h3>Cargando notificaciones...</h3>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="empty-state">
                                    <i className="bi bi-exclamation-triangle"></i>
                                    <h3>Error al cargar</h3>
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
                                            <div className="notification-checkbox">
                                                {notif.read ? (
                                                    <i
                                                        className="bi bi-bell"
                                                        style={{ color: "#a06bb5", fontSize: "1.2rem" }}
                                                    />
                                                ) : (
                                                    <i
                                                        className="bi bi-bell-fill"
                                                        style={{ color: "#f72585", fontSize: "1.2rem" }}
                                                    />
                                                )}
                                            </div>
                                            {/* <div className="notification-icon">
                                                <i className={notif.icon}></i>
                                            </div> */}
                                            <div className="notification-content">
                                                <div className="notification-main">
                                                    <h4 className="notification-title">
                                                        {notif.title}
                                                        {deletedNotifications.some(
                                                            (d) => d.id === notif.id
                                                        ) && " (eliminada)"}
                                                    </h4>
                                                    <p className="notification-preview">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                <div className="notification-meta">
                                                    <span
                                                        className="priority-badge"
                                                        style={{
                                                            backgroundColor: getPriorityColor(
                                                                notif.priority
                                                            ),
                                                        }}
                                                    >
                                                        {getPriorityText(notif.priority)}
                                                    </span>
                                                    <span className="notification-date">
                                                        {notif.date}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="notification-actions">
                                                {!notif.read && <div className="unread-dot" />}
                                                {!deletedNotifications.find(
                                                    (d) => d.id === notif.id
                                                ) && (
                                                        <button
                                                            className="btn-delete"
                                                            onClick={(e) => handleDelete(notif.id, e)}
                                                            title="Eliminar notificación"
                                                        >
                                                            <i className="bi bi-x-lg"></i>
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
                                        <i className="bi bi-bell"></i>
                                        <h3>No hay notificaciones</h3>
                                        <p>No tienes notificaciones en esta categoría</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div className="notifications-footer">
                            <button className="btn-view-all">
                                Ver todas las notificaciones
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selected && (
                <div
                    className="notification-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="notification-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <i className={selected.icon}></i>
                                <div>
                                    <h3>{selected.title}</h3>
                                    <div className="modal-meta">
                                        <span
                                            className="priority-badge"
                                            style={{
                                                backgroundColor: getPriorityColor(selected.priority),
                                            }}
                                        >
                                            {getPriorityText(selected.priority)}
                                        </span>
                                        <span className="modal-date">{selected.date}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn-close-modal"
                                onClick={handleCloseModal}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{selected.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={handleCloseModal}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;
