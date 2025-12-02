import { useState } from "react";
import "../../styles/EmployeeNavbar.css";
import logoFotoluna from "../../assets/img/logo.png";
import EmployeeNotifications from "../../features/Employee/Notification/Pages/NotiFicationEmploye";
import UserProfile from "../../features/Employee/Profile/Pages/UserProfile";
import SettingsModal from "../../features/Employee/Settings/Pages/SettingsModal";
import type { UserProfileData } from "../../features/Employee/Profile/Components/types/Profile";
import ThemeToggle from "./LightDarkTheme";

// 🚨 DEFINICIÓN FALTANTE DEL COMPONENTE DE NOTIFICACIONES (para que TS lo acepte aquí)
interface EmployeeNotificationsProps {
    onClose: () => void;
}
// 🚨 NOTA: Si EmployeeNotifications no exporta un FC, TypeScript puede necesitar ser forzado.

interface EmployeeNavbarProps {
    userName?: string;
    notificationCount?: number;
}

const EmployeeNavbar: React.FC<EmployeeNavbarProps> = ({
    // userName = "Amalia",
    notificationCount = 3
}) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false); // Nuevo estado para settings

    // Estado para el perfil del usuario
    const [userProfile, setUserProfile] = useState<UserProfileData>({
        id: 1,
        name: "Amalia",
        email: "amalia@example.com",
        bio: "Fotógrafa apasionada por los paisajes y la naturaleza.",
        avatar: null
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Búsqueda realizada");
    };

    const handleProfileUpdate = (updatedProfile: UserProfileData) => {
        setUserProfile(updatedProfile);
        setShowUserProfile(false);
        console.log("Perfil actualizado:", updatedProfile);
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        // Aquí va tu lógica de logout
        console.log('Cerrando sesión...');
        // Ejemplo:
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        // window.location.href = '/login';

        // Mostrar mensaje de confirmación
        alert('Sesión cerrada correctamente');
    };

    return (
        <nav className="EmployeeNavbar">
            <div className="navbar-container">
                {/* Logo y marca */}
                <div className="navbar-brand bg-custom-6">
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


                <div className="navbar-actions">
                    <nav className="navbar">

                        <ThemeToggle />
                    </nav>


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

                    {/* Botón de Configuración (Settings) */}
                    <button
                        className="settings-btn"
                        aria-label="Configuración"
                        onClick={() => setShowSettings(true)}
                    >
                        <i className="bi bi-gear-fill"></i>
                    </button>

                    {/* Área de Perfil de Usuario */}
                    <div
                        className="user-profile"
                        onClick={() => setShowUserProfile(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="user-avatar">
                            {userProfile.avatar ? (
                                <img
                                    src={userProfile.avatar}
                                    alt="Avatar"
                                    className="avatar-image-small"
                                />
                            ) : (
                                userProfile.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="user-name">{userProfile.name}</span>
                    </div>
                </div>
            </div>

            {/* Modal de Notificaciones (Aplicando el fix de tipado) */}
            {showNotifications && (
                <EmployeeNotifications 
                    // 🚨 Aplicar aserción si el componente no fue corregido internamente
                    {...({ onClose: () => setShowNotifications(false) } as EmployeeNotificationsProps)} 
                />
            )}

            {/* Modal de Perfil de Usuario */}
            <UserProfile
                isOpen={showUserProfile}
                onClose={() => setShowUserProfile(false)}
                profile={userProfile}
                onProfileUpdate={handleProfileUpdate}
            />

            {/* Modal de Configuración (Settings) */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onLogout={handleLogout}
            />
        </nav>
    );
};

export default EmployeeNavbar;