import { useEffect, useState } from "react";
import "../../styles/EmployeeNavbar.css";
import logoFotoluna from "../../assets/img/logo.png";
import EmployeeNotifications from "../../features/Employee/Notification/Pages/NotiFicationEmploye";
import UserProfile from "../../features/Employee/Profile/Pages/UserProfile";
import SettingsModal from "../../features/Employee/Settings/Pages/SettingsModal";
import type { UserProfileData } from "../../features/Employee/Profile/Components/types/Profile";
import ThemeToggle from "./LightDarkTheme";
import { useAuth } from "../../context/useAuth";

interface EmployeeNavbarProps {
    userName?: string;
    notificationCount?: number;
}

const EmployeeNavbar: React.FC<EmployeeNavbarProps> = ({
    notificationCount = 3
}) => {
    const auth = useAuth();
    const { user } = auth;
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const mapUserToProfile = (u: any): UserProfileData => ({
        id: u?.id ?? 0,
        name: u?.displayName ?? u?.firstName ?? u?.name ?? "Usuario",
        email: u?.email ?? "",
        bio: "",
        avatar: u?.avatar ?? null,
    });

    const [userProfile, setUserProfile] = useState<UserProfileData>(mapUserToProfile(user));

    useEffect(() => {
        setUserProfile(mapUserToProfile(user));
    }, [user]);

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

                    {/* Botón de Tema */}
                    {/* <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                        title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                    >
                        <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
                    </button> */}



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
                                (userProfile.name && userProfile.name.charAt(0).toUpperCase()) || "U"
                            )}
                        </div>
                        <span className="user-name">{userProfile.name}</span>
                    </div>
                </div>
            </div>

            {/* Modal de Notificaciones */}
            {showNotifications && (
                <EmployeeNotifications onClose={() => setShowNotifications(false)} />
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