import React, { useState } from "react"
import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
import "../../auth/styles/noti.css";

type Notification = {
    id: number;
    title: string;
    message: string;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
    date: string;
    category: 'today' | 'week' | 'older';
    icon: string;
};


const mockNotifications: Notification[] = [
    {
        id: 1,
        title: "Sesión reprogramada",
        message: "La sesión con Mario González se ha movido al viernes 15.",
        read: false,
        priority: 'high',
        date: "Hace 2 horas",
        category: 'today',
        icon: 'bi bi-calendar-check'
    },
    {
        id: 2,
        title: "Pedido listo",
        message: "Tu pedido de fondos fotográficos está listo para recoger.",
        read: false,
        priority: 'medium',
        date: "Hoy, 11:30",
        category: 'today',
        icon: 'bi bi-box-seam'
    },
    {
        id: 3,
        title: "Backup completado",
        message: "Se completó el backup automático de tus proyectos.",
        read: true,
        priority: 'low',
        date: "Hoy, 09:15",
        category: 'today',
        icon: 'bi bi-cloud-check'
    },
    {
        id: 4,
        title: "Nuevo cliente",
        message: "Ana Rodríguez está interesada en sesión de fotos.",
        read: false,
        priority: 'medium',
        date: "Ayer, 16:20",
        category: 'week',
        icon: 'bi bi-person-plus'
    },
    {
        id: 5,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    },
    {
        id: 6,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    }, {
        id: 7,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    }, {
        id: 8,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    }, {
        id: 9,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    }, {
        id: 10,
        title: "Pago confirmado",
        message: "El pago de Carlos Mendoza ha sido procesado.",
        read: true,
        priority: 'low',
        date: "15 Oct, 14:30",
        category: 'week',
        icon: 'bi bi-credit-card'
    },



];

const NotificationsEmployee = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [selected, setSelected] = useState<Notification | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'older'>('today');
    const [showPanel, setShowPanel] = useState(true); // <-- Nuevo estado

    const handleOpen = (notif: Notification) => {
        setSelected(notif);
        if (!notif.read) {
            setNotifications(notifications.map(n =>
                n.id === notif.id ? { ...n, read: true } : n
            ));
        }
    };

    const handleClosePanel = () => {
        setShowPanel(false); // <-- Oculta el panel
    };

    const handleCloseModal = () => {
        setSelected(null);
    };

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const getPriorityClass = (priority: string) => {
        switch (priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#E8B4D9';
            case 'medium': return '#D4A5E9';
            case 'low': return '#C8B6FF';
            default: return '#B8B5FF';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return priority;
        }
    };

    const filteredNotifications = notifications.filter(notif => notif.category === activeTab);
    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <EmployeeLayout>
            {showPanel &&
                (
                    <div className="notifications-panel" onClick={e => e.stopPropagation()}>
                        {/* Header del Panel */}
                        <div className="notifications-header">
                            <div className="header-content">
                                <h2>Notificaciones</h2>
                                <div className="header-actions">
                                    {activeTab !== "older" && (
                                        <span className="unread-count">
                                            {unreadCount} no leídas
                                        </span>
                                    )}
                                </div>
                                <button className="btn-close-panel" onClick={handleClosePanel} title="Cerrar panel">
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>

                        {/* Tabs de Navegación */}
                        <div className="notifications-tabs">
                            <button
                                className={`tab ${activeTab === 'today' ? 'active' : ''}`}
                                onClick={() => setActiveTab('today')}
                            >
                                Hoy
                            </button>
                            <button
                                className={`tab ${activeTab === 'week' ? 'active' : ''}`}
                                onClick={() => setActiveTab('week')}
                            >
                                Esta semana
                            </button>
                            <button
                                className={`tab ${activeTab === 'older' ? 'active' : ''}`}
                                onClick={() => setActiveTab('older')}
                            >
                                Anteriores
                            </button>
                        </div>

                        {/* Lista de Notificaciones */}
                        <div className="notifications-list-container">
                            {filteredNotifications.length > 0 ? (
                                <div className="notifications-list">
                                    {filteredNotifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${getPriorityClass(notif.priority)} ${notif.read ? 'read' : 'unread'
                                                }`}
                                            onClick={() => handleOpen(notif)}
                                        >
                                            <div className="notification-checkbox">
                                                {notif.read ? (
                                                    <i className="bi bi-bell" style={{ color: "#a06bb5", fontSize: "1.2rem" }}></i>
                                                ) : (
                                                    <i className="bi bi-bell-fill" style={{ color: "#f72585", fontSize: "1.2rem" }}></i>
                                                )}
                                            </div>
                                            <div className="notification-icon">
                                                <i className={notif.icon}></i>
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-main">
                                                    <h4 className="notification-title">{notif.title}</h4>
                                                    <p className="notification-preview">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                <div className="notification-meta">
                                                    <span
                                                        className="priority-badge"
                                                        style={{ backgroundColor: getPriorityColor(notif.priority) }}
                                                    >
                                                        {getPriorityText(notif.priority)}
                                                    </span>
                                                    <span className="notification-date">{notif.date}</span>
                                                </div>
                                            </div>
                                            <div className="notification-actions">
                                                {!notif.read && <div className="unread-dot"></div>}
                                                <button
                                                    className="btn-delete"
                                                    onClick={(e) => handleDelete(notif.id, e)}
                                                    title="Eliminar notificación"
                                                >
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <i className="bi bi-bell"></i>
                                    <h3>No hay notificaciones</h3>
                                    <p>No tienes notificaciones en esta categoría</p>
                                </div>
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


            {/* Modal de Detalles */}
            {selected && (
                <div className="notification-modal-overlay" onClick={handleCloseModal}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <i className={selected.icon}></i>
                                <div>
                                    <h3>{selected.title}</h3>
                                    <div className="modal-meta">
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(selected.priority) }}
                                        >
                                            {getPriorityText(selected.priority)}
                                        </span>
                                        <span className="modal-date">{selected.date}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-close-modal" onClick={handleCloseModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{selected.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
};
export default NotificationsEmployee;