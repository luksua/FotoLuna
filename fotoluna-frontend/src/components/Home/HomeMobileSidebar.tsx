import React, { useState, useEffect } from "react";
import "../../styles/homeSideNav.css";
import "./styles/homeMobileSidebar.css";
import { useAuth } from "../../context/useAuth";
import { Link, useLocation } from "react-router-dom";
import HomeButton from "./HomeButton";
import { Offcanvas } from "bootstrap";

const HomeMobileSidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
    const location = useLocation();

    const togglePortfolio = () => setIsPortfolioOpen(!isPortfolioOpen);

    useEffect(() => {
        const cleanupBackdrop = async () => {

            // Cierra cualquier offcanvas abierto
            document.querySelectorAll(".offcanvas.show").forEach((canvas) => {
                const instance = Offcanvas.getInstance(canvas as HTMLElement);
                instance?.hide();
            });

            // Espera un poco a que Bootstrap anime el cierre, luego borra cualquier overlay residual
            setTimeout(() => {
                document.querySelectorAll(".offcanvas-backdrop").forEach((backdrop) => {
                    backdrop.remove();
                });

                // Limpia también clases bloqueadoras del body
                document.body.classList.remove("offcanvas-backdrop", "modal-open");
                document.body.style.overflow = "";
            }, 300); // 300ms coincide con la animación de Bootstrap
        };

        cleanupBackdrop();
    }, [location]);

    return (
        <div
            className="offcanvas offcanvas-end sidebar-fotoluna"
            tabIndex={-1}
            id="mobileMenu"
            aria-labelledby="mobileMenuLabel"
        >
            {/* ======== ENCABEZADO ======== */}
            <div className="offcanvas-header justify-content-between px-4 pt-4 bg-custom-6">
                <h1 className="sidebar-logo">
                    {/* <img src="/img/logo.png" alt="" /> */}
                    {/* <i className="bi bi-camera me-2"></i> */}
                    <span className="">Foto</span>Luna
                </h1>
                <button
                    type="button"
                    className="sidebar-close-btn"
                    aria-label="Cerrar"
                    onClick={() => {
                        const mobileEl = document.getElementById("mobileMenu");
                        if (mobileEl) {
                            const instance =
                                Offcanvas.getInstance(mobileEl) ?? new Offcanvas(mobileEl);
                            instance.hide();
                        }
                    }}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

            </div>

            {/* ======== CUERPO ======== */}
            <div className="offcanvas-body d-flex flex-column justify-content-between px-4">
                <div>
                    {/* --- SI HAY SESIÓN INICIADA --- */}
                    {user ? (
                        <>
                            <div className="user-card mb-4 d-flex align-items-center gap-3">
                                <div className="user-avatar-container">
                                    <img
                                        src={user.avatar || "/img/perfil.png"}
                                        alt={user.displayName ?? user.name ?? "Usuario"}
                                        className="user-avatar"
                                    />
                                </div>
                                <div>
                                    <div className="fw-bold">
                                        {user.displayName ?? user.name ?? "Usuario Nombre"}
                                    </div>
                                    <Link to="/miCuenta" className="user-subtext">
                                        Mi cuenta
                                    </Link>
                                </div>
                            </div>

                            {/* Opciones del usuario */}
                            <ul className="nav-links list-unstyled">
                                <li>
                                    <Link to="/citas" className="nav-link">
                                        <i className="bi bi-calendar-event me-3"></i>Citas
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/fotos" className="nav-link">
                                        <i className="bi bi-images me-3"></i>Mis Fotos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/notificaciones" className="nav-link">
                                        <i className="bi bi-bell me-3"></i>Notificaciones
                                    </Link>
                                </li>
                            </ul>

                            <hr className="sidebar-divider" />
                        </>
                    ) : (
                        <>
                            {/* --- SIN SESIÓN INICIADA --- */}
                            <div className="text-center mt-3 mb-4">
                                <HomeButton to="/iniciarSesion" value="Iniciar Sesión" />
                                <br />
                                <br />
                                <HomeButton to="/registrarse" value="Crear Cuenta" />
                            </div>

                            <hr className="sidebar-divider" />
                        </>
                    )}

                    {/* Enlaces principales (visibles siempre) */}
                    <ul className="nav-links list-unstyled">
                        <li>
                            <Link to="/" className="nav-link active">
                                <i className="bi bi-house-door me-3"></i>Inicio
                            </Link>
                        </li>
                        <li>
                            <Link to="/contacto" className="nav-link">
                                <i className="bi bi-telephone me-3"></i>Contacto
                            </Link>
                        </li>
                        <li>
                            <Link to="/sobreMi" className="nav-link">
                                <i className="bi bi-person-badge me-3"></i>Sobre Mí
                            </Link>
                        </li>

                        {/* Submenú Portafolio */}
                        <li>
                            <button className="nav-link dropdown-toggle-btn" onClick={togglePortfolio}>
                                <i className="bi bi-collection me-3"></i>Portafolio
                                <i
                                    className={`bi ms-auto ${isPortfolioOpen ? "bi-chevron-up" : "bi-chevron-down"
                                        }`}
                                ></i>
                            </button>
                            {isPortfolioOpen && (
                                <ul className="submenu list-unstyled ms-4 mt-2">
                                    <li><a href="#maternity">Maternidad</a></li>
                                    <li><a href="#birthday">Cumpleaños</a></li>
                                    <li><a href="#quinces">Quince años</a></li>
                                    <li><a href="#wedding">Bodas</a></li>
                                    <li><a href="#sacraments">Sacramentos</a></li>
                                    <li><a href="#documents">Documento</a></li>
                                    <li><a href="#graduation">Grados</a></li>
                                    <li><a href="#others">Otros</a></li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>

                {/* ======== PIE DE MENÚ ======== */}
                {user && (
                    <div className="logout-section mb-3">
                        <button className="logout-btn w-100" onClick={logout}>
                            <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeMobileSidebar;
