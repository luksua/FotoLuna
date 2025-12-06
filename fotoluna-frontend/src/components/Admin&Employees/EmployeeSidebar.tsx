import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Escucha el botón hamburguesa
    useEffect(() => {
        const toggleHandler = () => setIsOpen(prev => !prev);
        document.addEventListener("toggle-sidebar", toggleHandler);
        return () => document.removeEventListener("toggle-sidebar", toggleHandler);
    }, []);

    const menuItems = [
        { id: "inicio", icon: "bi bi-house-heart-fill", text: "Inicio", path: "/empleado" },
        { id: "citas", icon: "bi bi-calendar2-heart-fill", text: "Citas", path: "/employee/appointments" },
        { id: "subir", icon: "bi bi-cloud-upload-fill", text: "Subir", path: "/employee/upload" },
        { id: "administrar", icon: "bi bi-gear-wide-connected", text: "Administrar", path: "/employee/admin" },
        { id: "clientes", icon: "bi bi-people-fill", text: "Clientes", path: "/employee/customers" },
        { id: "pagos", icon: "bi bi-wallet", text: "Pagos", path: "/employee/payments" }
    ];

    return (
        <>
            {/* Fondo oscuro cuando el sidebar está abierto en móvil */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                        >
                            <i className={item.icon}></i>
                            <span className="menu-text">{item.text}</span>
                        </Link>
                    ))}
                </ul>
            </aside>
        </>
    );
};

export default AdminSidebar;

