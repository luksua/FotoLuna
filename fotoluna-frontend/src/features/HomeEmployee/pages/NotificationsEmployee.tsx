// import React, { useState } from "react";
// import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
// import "../../auth/styles/NotificationEmployee.css";

// type Notification = {
//     id: number;
//     title: string;
//     message: string;
//     read: boolean;
// };

// const mockNotifications: Notification[] = [
//     { id: 1, title: "Nueva cita agendada", message: "Tienes una cita el 20 de octubre a las 3:00pm.", read: false },
//     { id: 2, title: "Archivo subido", message: "El archivo 'evento.jpg' fue subido correctamente.", read: false },
//     { id: 3, title: "Cliente confirmado", message: "El cliente Juan Pérez confirmó su asistencia.", read: true },
// ];

// const EmployeeNotifications = () => {
//     const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
//     const [selected, setSelected] = useState<Notification | null>(null);

//     const handleOpen = (notif: Notification) => {
//         setSelected(notif);
//         setNotifications(notifications.map(n =>
//             n.id === notif.id ? { ...n, read: true } : n
//         ));
//     };

//     const handleClose = () => setSelected(null);

//     return (
//         <EmployeeLayout>
//             <h2>Notificaciones</h2>
//             <hr />
//             <ul className="notifications-list">
//                 {notifications.map(notif => (
//                     <li
//                         key={notif.id}
//                         className={notif.read ? "read" : "unread"}
//                         onClick={() => handleOpen(notif)}
//                         style={{
//                             cursor: "pointer",
//                             background: notif.read ? "#f7f3fa" : "#e0d0e0",
//                             marginBottom: 8,
//                             padding: 12,
//                             borderRadius: 8,
//                         }}
//                     >
//                         <b>{notif.title}</b>
//                         <span style={{ float: "right", color: "#dcabdf" }}>
//                             {notif.read ? <i className="bi bi-bell"></i> : <i className="bi bi-bell-fill"></i>}
//                         </span>
//                     </li>
//                 ))}
//             </ul>

//             {/* Modal para ver el mensaje */}
//             {selected && (
//                 <div className="notification-modal" style={{
//                     position: "fixed",
//                     top: 0, left: 0, right: 0, bottom: 0,
//                     background: "rgba(0,0,0,0.2)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     zIndex: 9999,
//                 }}>
//                     <div style={{
//                         background: "#fff",
//                         padding: 32,
//                         borderRadius: 12,
//                         minWidth: 320,
//                         boxShadow: "0 2px 12px #a06bb5"
//                     }}>
//                         <h3>{selected.title}</h3>
//                         <p>{selected.message}</p>
//                         <button onClick={handleClose} style={{
//                             marginTop: 16,
//                             background: "#dcabdf",
//                             color: "#fff",
//                             border: "none",
//                             borderRadius: 8,
//                             padding: "8px 24px",
//                             cursor: "pointer"
//                         }}>Cerrar</button>
//                     </div>
//                 </div>
//             )}
//         </EmployeeLayout>
//     );
// };

// export default EmployeeNotifications;

import React, { useState } from "react";
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

type Props = {
    onClose: () => void;
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

const EmployeeNotifications: React.FC<Props> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [selected, setSelected] = useState<Notification | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'older'>('today');

    const handleOpen = (notif: Notification) => {
        setSelected(notif);
        if (!notif.read) {
            setNotifications(notifications.map(n =>
                n.id === notif.id ? { ...n, read: true } : n
            ));
        }
    };

    const handleClose = () => setSelected(null);

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
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
                        <button className="btn-close-panel" onClick={onClose} title="Cerrar panel">
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

            {/* Modal de Detalles */}
            {selected && (
                <div className="notification-modal-overlay" onClick={onClose}>
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
                            <button className="btn-close-modal" onClick={handleClose}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{selected.message}</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleClose}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
};

export default EmployeeNotifications;
