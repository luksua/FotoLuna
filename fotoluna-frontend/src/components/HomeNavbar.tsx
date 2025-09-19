import React from "react"
import "../styles/HomeNav.css";
import "../styles/homeSideNav.css";
import HomeSidebar from "./HomeSidebar";
import logo from "../assets/img/logo.jpg";
import perfil from "../assets/img/perfil.png";
import HomeButton from "./HomeButton";

const NavHome: React.FC = () => {
    return (
        <>
            <nav className="navbar navbar-border navbar-expand-lg fixed-top navbar-custom">
                <div className="eslogan-border bg-custom-3">La fotografía recuerda lo que la mente olvida</div>

                <div className="d-flex align-items-center">
                    <a className="navbar-brand d-flex align-items-center gap-2" href="{{ route('welcome') }}">
                        <img src={logo} className="logo-img" alt="Logo" />
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
                            <a className="nav-link" href="contacto.html">Contacto</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link portafolio-btn dropdown-toggle d-flex align-items-center justify-content-between"
                                href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Portafolio
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="cumpleaños.html">Maternidad</a></li>
                                <li><a className="dropdown-item" href="cumpleaños.html">Cumpleaños</a></li>
                                <li><a className="dropdown-item" href="quinceaños.html">Quince años</a></li>
                                <li><a className="dropdown-item" href="bodas.html">Bodas</a></li>
                                <li><a className="dropdown-item" href="bautizo.html">Bautizos</a></li>
                                <li><a className="dropdown-item" href="familia.html">Familia</a></li>
                                <li><a className="dropdown-item" href="grados.html">Grados</a></li>
                                <li><a className="dropdown-item" href="otros.html">Otros</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="sobremi.html">Sobre Mí</a>
                        </li>

                        <li className="nav-item ms-3 d-none d-lg-block">
                            <button className="btn p-0 border-0 bg-transparent" type="button" data-bs-toggle="offcanvas"
                                data-bs-target="#perfilMenu" aria-controls="perfilMenu">
                                <img src={perfil} className="perfil-img" alt="Perfil" />
                            </button>
                        </li>
                        <li className="nav-item registro mb-3">
                            <HomeButton
                                value="Iniciar Sesión"
                                type="submit"
                            />
                        </li>
                        <li className="nav-item iniciar">
                            {/* <a href="{{ route('customer.login') }}" className="btn btn-perfil w-100">Iniciar Sesión</a> */}
                            <HomeButton
                                value="Iniciar Sesión"
                                type="submit"
                            />
                        </li>
                    </ul>
                </div>
            </nav>
            <HomeSidebar />
        </>
    )
}

export default NavHome;