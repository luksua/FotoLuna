import React, { useState } from "react";
import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";

const EmployeeSidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState("inicio");
    const location = useLocation();

    const menuItems = [
        { id: "inicio", icon: "bi bi-house-heart-fill", text: "Inicio", path: "/" },
        { id: "citas", icon: "bi bi-calendar2-heart-fill", text: "Citas", path: "/employee/appointments" },
        { id: "subir", icon: "bi bi-cloud-upload-fill", text: "Subir", path: "/employee/upload" },
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
                        <i className={item.icon}></i>
                        <span className="menu-text">
                            <Link to={item.path}>{item.text}</Link>
                        </span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default EmployeeSidebar;