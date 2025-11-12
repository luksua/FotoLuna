import { useState } from "react";
import "../../styles/EmployeeNavbar.css";
import logoFotoluna from "../../assets/img/logo.png";
import { Link } from "react-router-dom";
import EmployeeNotifications from "../../features/Admin/Notification/Pages/NotificationsEmployee";
import "../../features/Admin/Notification/Styles/noti.css";

interface EmployeeNavbarProps {
    userName?: string;
    notificationCount?: number;
}

const EmployeeNavbar: React.FC<EmployeeNavbarProps> = ({
    userName = "Amalia",
    notificationCount = 3
}) => {
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de búsqueda aquí
        console.log("Búsqueda realizada");
    };

    const handleNotificationClick = () => {
        alert(`Tienes ${notificationCount} notificaciones nuevas`);
    };
    const [showNotifications, setShowNotifications] = useState(false);


    return (
        <nav className="EmployeeNavbar">
            <div className="navbar-container">
                {/* Logo y marca */}
                <div className="navbar-brand">
                    <div className="logo-icon">
                        <img src={logoFotoluna} alt="Logo" className="EmployeeNavbar-logo mb-1" />

                    </div>
                    <h1 className="logo-text">FotoLuna</h1>
                </div>

                {/* Barra de búsqueda */}
                <div className="navbar-search">
                    <form className="search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar..."
                            aria-label="Buscar"
                        />

                        
                        <button type="submit" className="search-button">
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                </div>

                {/* Navegación y acciones */}
                <div className="navbar-actions ">
                    {/* <Link to="/employee/HomeEmployee" className="nav-link">
                        <i className="fas fa-home"></i>
                        <span>Inicio</span>
                    </Link> */}

                    <button
                        className="notification-btn"
                        onClick={() => setShowNotifications(true)}
                        aria-label="Notificaciones"
                    >
                        <i className="bi bi-bell-fill"></i>
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </button>

                    <button className="settings-btn" aria-label="Configuración">
                        <i className="bi bi-gear-fill"></i>
                    </button>

                    <div className="user-profile">
                        <div className="user-avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{userName}</span>
                    </div>
                </div>
            </div>
            {showNotifications && (
                <EmployeeNotifications onClose={() => setShowNotifications(false)} />
            )}
        </nav>
    );
};

export default EmployeeNavbar;

