import React from "react"
import "../../styles/HomeNav.css";
import "../../styles/homeSideNav.css";
import HomeSidebar from "./HomeSidebar";
import HomeButton from "./HomeButton";

const HomeNav: React.FC = () => {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const navbarHeight = 80; // Ajusta según la altura de tu navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <nav className="navbar navbar-border navbar-expand-lg fixed-top navbar-custom">
                <div className="eslogan-border bg-custom-3">La fotografía recuerda lo que la mente olvida</div>

                <div className="d-flex align-items-center">
                    <a className="navbar-brand d-flex align-items-center gap-2" href="/">
                        <img src="/img/logo.jpg" className="logo-img" alt="Logo" />
                        <div className="fw-bold bg-custom-6 logo-text">
                            <h1> FotoLuna </h1>
                        </div>
                    </a>
                </div>

                {/* Botón hamburguesa */}
                <div className="menu">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/*Contenido colapsable alineado a la derecha*/}
                <div className="collapse navbar-collapse justify-content-end pe-3 " id="navbarContent">
                    <ul className="navbar-nav mobile-menu bg-custom-2 mb-2 mb-lg-0 d-flex align-items-center">
                        <li className="nav-item">
                            <a className="nav-link" href="/contacto">Contacto</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link portafolio-btn dropdown-toggle d-flex align-items-center justify-content-between"
                                href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Portafolio
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a className="dropdown-item" href="#maternity"
                                        onClick={(e) => handleNavClick(e, 'maternity')}>
                                        Maternidad
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#birthday"
                                        onClick={(e) => handleNavClick(e, 'birthday')}>
                                        Cumpleaños
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#quinces"
                                        onClick={(e) => handleNavClick(e, 'quinces')}>
                                        Quince años
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#wedding"
                                        onClick={(e) => handleNavClick(e, 'wedding')}>
                                        Bodas
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#sacraments"
                                        onClick={(e) => handleNavClick(e, 'sacraments')}>
                                        Sacramentos
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#documents">
                                        Documento
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#graduation">
                                        Grados
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item" href="#others">
                                        Otros
                                    </a>
                                    </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/sobreMi">Sobre Mí</a>
                        </li>

                        <li className="nav-item ms-3 d-none d-lg-block">
                            <button className="btn p-0 border-0 bg-transparent" type="button" data-bs-toggle="offcanvas"
                                data-bs-target="#perfilMenu" aria-controls="perfilMenu">
                                <img src="/img/perfil.png" className="perfil-img" alt="Perfil" />
                            </button>
                        </li>
                        <li className="nav-item registro mb-3">
                            <HomeButton
                                to="/registrarse"
                                value="Crear Cuenta"
                            />
                        </li>
                        <li className="nav-item iniciar">
                            <HomeButton
                                to="/iniciarSesion"
                                value="Iniciar Sesión"
                            />
                        </li>
                    </ul>
                </div>
            </nav>
            <HomeSidebar />
        </>
    )
}

export default HomeNav;