import "../../styles/EmployeeSidebar.css";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        { id: "inicio", icon: "bi bi-house-heart-fill", text: "Inicio", path: "/empleado" },
        { id: "citas", icon: "bi bi-calendar2-heart-fill", text: "Citas", path: "/employee/appointments" },
        { id: "subir", icon: "bi bi-cloud-upload-fill", text: "Subir", path: "/employee/upload" },
        { id: "administrar", icon: "bi bi-gear-wide-connected", text: "Administrar", path: "/employee/admin" },
        { id: "clientes", icon: "bi bi-people-fill", text: "Clientes", path: "/employee/customers" },
        { id: "pagos", icon: "bi bi-wallet", text: "Pagos", path: "/employee/payments" }
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

