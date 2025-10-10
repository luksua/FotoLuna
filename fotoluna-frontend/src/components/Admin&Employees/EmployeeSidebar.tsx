import React, { useState } from "react";
import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";

const EmployeeSidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState("inicio");
    const location = useLocation();

    const menuItems = [
        { id: "inicio", icon: "bi bi-house-heart-fill", text: "Inicio", path: "/" },
        { id: "citas", icon: "bi bi-speedometer2", text: "Dashboard", path: "/dashboard" },
        { id: "subir", icon: "bi bi-journal-plus", text: "Registro Usuarios", path: "/RegisterUsers" },
        { id: "administrar", icon: "bi bi-gear-wide-connected", text: "Administrar", path: "/employee/admin" },
        { id: "clientes", icon: "bi bi-people-fill", text: "Clientes", path: "/employee/customers" },
    
    ];

    return (
        <aside className="sidebar">
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setActiveItem(item.id)}
                    >
                        <Link to={item.path} style={{ display: 'flex', alignItems: 'center', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                            <i className={item.icon} style={{ marginRight: 12 }}></i>
                            <span className="menu-text">{item.text}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default EmployeeSidebar;