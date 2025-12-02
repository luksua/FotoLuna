/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import "../../styles/EmployeeNavbar.css";
import logoFotoluna from "../../assets/img/logo.png";
import NotificationBell from '../NotificationBell';
import UserProfile from "../../features/Employee/Profile/Pages/UserProfile";
import SettingsModal from "../../features/Employee/Settings/Pages/SettingsModal";
import type { UserProfileData } from "../../features/Employee/Profile/Components/types/Profile";
import ThemeToggle from "./LightDarkTheme";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../components/ConfirmModal";

interface EmployeeNavbarProps {
    userName?: string;
}

const EmployeeNavbar: React.FC<EmployeeNavbarProps> = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Cerrar dropdown cuando se abre un modal
    useEffect(() => {
        if (showUserProfile || showSettings) {
            setShowDropdown(false);
        }
    }, [showUserProfile, showSettings]);

    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Búsqueda realizada");
    };

    const handleProfileUpdate = (updatedProfile: UserProfileData) => {
        setUserProfile(updatedProfile);
        setShowUserProfile(false);
        console.log("Perfil actualizado:", updatedProfile);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    const handleProfileClick = () => {
        setShowUserProfile(true);
    };

    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    return (
        <nav className="EmployeeNavbar">
            <div className="navbar-container">
                {/* Logo y marca */}
                <div className="navbar-brand bg-custom-6">
                    <div className="logo-icon">
                        <img
                            src={logoFotoluna}
                            alt="Logo"
                            className="EmployeeNavbar-logo mb-1"
                        />
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

                    {/* 🔔 Campanita de notificaciones */}
                    {user && <NotificationBell />}

                    {/* Área de Perfil de Usuario con Dropdown */}
                    <div className="user-profile-container" ref={dropdownRef}>
                        <div
                            className="user-profile"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ cursor: "pointer" }}
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

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="user-dropdown-menu">
                                <button
                                    className="dropdown-item"
                                    onClick={handleProfileClick}
                                >
                                    <i className="bi bi-person-circle me-2"></i>
                                    Perfil
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={handleSettingsClick}
                                >
                                    <i className="bi bi-gear-fill me-2"></i>
                                    Ajustes
                                </button>
                                <hr className="dropdown-divider" />
                                <button
                                    className="dropdown-item dropdown-item-danger"
                                    onClick={handleLogoutClick}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Perfil de usuario modal */}
            <UserProfile
                isOpen={showUserProfile}
                onClose={() => setShowUserProfile(false)}
                profile={userProfile}
                onProfileUpdate={handleProfileUpdate}
            />

            {/* Modal de Configuración */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Modal de confirmación de logout */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="¿Está seguro de cerrar sesión?"
                type="error"
            />
        </nav>
    );
};

export default EmployeeNavbar;