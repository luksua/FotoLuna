import React, { useState } from "react";
import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState("dashboard");
    const location = useLocation();

    const menuItems = [
        { id: "dashboard", icon: "bi bi-graph-up", text: "Dashboard", path: "/dashboard" },
        { id: "subir", icon: "bi bi-journal-plus", text: "Registro Usuarios", path: "/RegisterUsers" },
        { id: "administrar", icon: "bi bi-gear-wide-connected", text: "Administrar", path: "/AdminUsers" },
        { id: "clientes", icon: "bi bi-people-fill", text: "Empleados", path: "/AdminEmployee" },
        { id: "Events", icon: "bi bi-card-checklist", text: "Eventos", path: "/AdminEvents" },
        { id: "Citas", icon: "bi bi-calendar-event", text: "Citas", path: "/AdminAppointments" },
    ];

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <i className={item.icon}></i>
                        <span className="menu-text">{item.text}</span>
                    </Link>
                ))}
            </ul>
        </aside>
    );
};

export default AdminSidebar;

