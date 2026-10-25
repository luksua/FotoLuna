import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";


const AdminSidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState("dashboard");
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const toggleHandler = () => setIsOpen(prev => !prev);
        document.addEventListener("toggle-sidebar", toggleHandler);
        return () => document.removeEventListener("toggle-sidebar", toggleHandler);
    }, []);


    const menuItems = [
        { id: "dashboard", icon: "bi bi-graph-up", text: "Dashboard", path: "/dashboard" },
        { id: "subir", icon: "bi bi-journal-plus", text: "Registro Usuarios", path: "/RegisterUsers" },
        { id: "administrar", icon: "bi bi-gear-wide-connected", text: "Administrar", path: "/AdminUsers" },
        { id: "clientes", icon: "bi bi-people-fill", text: "Empleados", path: "/AdminEmployee" },
        { id: "Events", icon: "bi bi-card-checklist", text: "Eventos", path: "/AdminEvents" },
        { id: "Citas", icon: "bi bi-calendar-event", text: "Citas", path: "/AdminAppointments" },
        { id: "fotos", icon: "bi bi-camera-fill", text: "Fotos", path: "/AdminPhotos" },
        { id: "pagos", icon: "bi bi-wallet", text: "Pagos", path: "/AdminPayments" }
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
