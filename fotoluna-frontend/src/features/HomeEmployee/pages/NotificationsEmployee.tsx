import React, { useState } from "react";
import EmployeeLayout from "../../../layouts/HomeEmployeeLayout";
import "../../auth/styles/NotificationEmployee.css";

type Notification = {
    id: number;
    title: string;
    message: string;
    read: boolean;
};

const mockNotifications: Notification[] = [
    { id: 1, title: "Nueva cita agendada", message: "Tienes una cita el 20 de octubre a las 3:00pm.", read: false },
    { id: 2, title: "Archivo subido", message: "El archivo 'evento.jpg' fue subido correctamente.", read: false },
    { id: 3, title: "Cliente confirmado", message: "El cliente Juan Pérez confirmó su asistencia.", read: true },
];

const EmployeeNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [selected, setSelected] = useState<Notification | null>(null);

    const handleOpen = (notif: Notification) => {
        setSelected(notif);
        setNotifications(notifications.map(n =>
            n.id === notif.id ? { ...n, read: true } : n
        ));
    };

    const handleClose = () => setSelected(null);

    return (
        <EmployeeLayout>
            <h2>Notificaciones</h2>
            <hr />
            <ul className="notifications-list">
                {notifications.map(notif => (
                    <li
                        key={notif.id}
                        className={notif.read ? "read" : "unread"}
                        onClick={() => handleOpen(notif)}
                        style={{
                            cursor: "pointer",
                            background: notif.read ? "#f7f3fa" : "#e0d0e0",
                            marginBottom: 8,
                            padding: 12,
                            borderRadius: 8,
                        }}
                    >
                        <b>{notif.title}</b>
                        <span style={{ float: "right", color: "#dcabdf" }}>
                            {notif.read ? <i className="bi bi-bell"></i> : <i className="bi bi-bell-fill"></i>}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Modal para ver el mensaje */}
            {selected && (
                <div className="notification-modal" style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}>
                    <div style={{
                        background: "#fff",
                        padding: 32,
                        borderRadius: 12,
                        minWidth: 320,
                        boxShadow: "0 2px 12px #a06bb5"
                    }}>
                        <h3>{selected.title}</h3>
                        <p>{selected.message}</p>
                        <button onClick={handleClose} style={{
                            marginTop: 16,
                            background: "#dcabdf",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 24px",
                            cursor: "pointer"
                        }}>Cerrar</button>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
};

export default EmployeeNotifications;