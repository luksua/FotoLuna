import React from "react";
import "../../styles/HomeNav.css";
import "../../styles/homeSideNav.css";
import HomeMobileSidebar from "./HomeMobileSidebar";
import HomeSidebar from "./HomeSidebar";
import HomeButton from "./HomeButton";
import { useAuth } from "../../context/useAuth";
import Button from "./Button";
import * as bootstrap from "bootstrap";
import NotificationBell from '../NotificationBell';

const HomeNav: React.FC = () => {
    const { user, loading } = useAuth();

    const scrollToId = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string
    ) => {
        // Si estamos en la home, prevenimos la navegación y hacemos el scroll
        if (location.pathname === "/" || location.pathname === "") {
            e.preventDefault();
            scrollToId(targetId);
        } else {
            // Si no estamos en la home, dejamos que navegue a "/#id"
        }
    };

    const avatarSrc = user?.avatar || "/img/perfil.png";
    const avatarAlt = user?.displayName ?? user?.name ?? "Perfil";

    return (
        <>
            <nav className="navbar navbar-border navbar-expand-lg fixed-top navbar-custom">
                <div className="eslogan-border bg-custom-3">
                    La fotografía recuerda lo que la mente olvida
                </div>

                <div className="d-flex align-items-center">
                    <a className="navbar-brand d-flex align-items-center gap-2" href="/">
                        <img src="/img/logo.jpg" className="logo-img" alt="Logo" />
                        <div className="fw-bold bg-custom-6 logo-text">
                            <h1> FotoLuna </h1>
                        </div>
                    </a>
                </div>

                {/* Botón hamburguesa - Solo visible en móviles/tablets */}
                <div className="menu d-lg-none">
                    <button
                        type="button"
                        className="btn menu-toggle-btn"
                        onClick={() => {
                            // Cerrar perfil si está abierto
                            const perfilEl = document.getElementById("perfilMenu");
                            if (perfilEl) {
                                const perfil =
                                    bootstrap.Offcanvas.getInstance(perfilEl) ??
                                    new bootstrap.Offcanvas(perfilEl);
                                perfil.hide();
                            }

                            // Abrir menú móvil
                            const mobileEl = document.getElementById("mobileMenu");
                            if (mobileEl) {
                                const mobile =
                                    bootstrap.Offcanvas.getInstance(mobileEl) ??
                                    new bootstrap.Offcanvas(mobileEl);
                                mobile.show();
                            }
                        }}
                    >
                        {/* Icono hamburguesa (Bootstrap Icons) */}
                        <i className="bi bi-list fs-1"></i>
                    </button>
                </div>


                {/* Menú normal - Solo visible en escritorio */}
                <div className="collapse navbar-collapse justify-content-end pe-3" id="navbarContent">
                    <ul className="navbar-nav mobile-menu bg-custom-2 mb-2 mb-lg-0 d-flex align-items-center">
                        <li className="nav-item">
                            <div className="p-2">
                                <Button
                                    className="btn btn-perfil w-100 w-sm-auto"
                                    value="Agenda tu sesión aquí"
                                    to="/nuevaCita"
                                >
                                    ¡Agenda tu sesión aquí!
                                </Button>
                            </div>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/contacto">
                                Contacto
                            </a>
                        </li>

                        <li className="nav-item dropdown">
                            <a
                                className="nav-link portafolio-btn dropdown-toggle d-flex align-items-center justify-content-between"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Portafolio
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/#maternity"
                                        onClick={(e) => handleNavClick(e, "maternity")}
                                    >
                                        Maternidad
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/#birthday"
                                        onClick={(e) => handleNavClick(e, "birthday")}
                                    >
                                        Cumpleaños
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/#quinces"
                                        onClick={(e) => handleNavClick(e, "quinces")}
                                    >
                                        Quince años
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/#wedding"
                                        onClick={(e) => handleNavClick(e, "wedding")}
                                    >
                                        Bodas
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item"
                                        href="/#sacraments"
                                        onClick={(e) => handleNavClick(e, "sacraments")}
                                    >
                                        Sacramentos
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="/#documents">
                                        Documento
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="/#graduation">
                                        Grados
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="/#others">
                                        Otros
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/sobreMi">
                                Sobre Nosotros
                            </a>
                        </li>
                        <nav>
                            {user && <span>Bienvenido, {user.name}</span>}
                        </nav>

                        {user && <NotificationBell />}

                        {/* Perfil / avatar: abre el offcanvas de perfil */}
                        <li className="nav-item ms-3 d-none d-lg-block">
                            <button
                                className="btn p-0 border-0 bg-transparent"
                                type="button"
                                onClick={() => {
                                    // Cerrar mobileMenu
                                    const mobileEl = document.getElementById("mobileMenu");
                                    if (mobileEl) {
                                        const mobile = bootstrap.Offcanvas.getInstance(mobileEl) ?? new bootstrap.Offcanvas(mobileEl);
                                        mobile.hide();
                                    }

                                    // Abrir perfilMenu
                                    const perfilEl = document.getElementById("perfilMenu");
                                    if (perfilEl) {
                                        const perfil = bootstrap.Offcanvas.getInstance(perfilEl) ?? new bootstrap.Offcanvas(perfilEl);
                                        perfil.show();
                                    }
                                }}
                            >
                                <img
                                    src={avatarSrc}
                                    className="perfil-img rounded-circle"
                                    alt={avatarAlt}
                                    style={{ width: 40, height: 40, objectFit: "cover" }}
                                />
                            </button>
                        </li>

                        {/* Si NO hay usuario, mostrar Crear Cuenta / Iniciar Sesión */}
                        {!user && !loading && (
                            <>
                                <li className="nav-item registro mb-3">
                                    <HomeButton to="/registrarse" value="Crear Cuenta" />
                                </li>
                                <li className="nav-item iniciar">
                                    <HomeButton to="/iniciarSesion" value="Iniciar Sesión" />
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            {/* Offcanvas móviles y sidebar de perfil */}
            <HomeMobileSidebar />
            <HomeSidebar />
        </>
    );
};

export default HomeNav;
