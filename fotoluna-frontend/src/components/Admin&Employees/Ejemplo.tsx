// EmployeeNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./EmployeeNavbar.css";

// Definimos las props si es necesario
interface EmployeeNavbarProps {
    // Podemos agregar props aquí si las necesitamos
}

const EmployeeNavbar: React.FC<EmployeeNavbarProps> = () => {
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de búsqueda aquí
        console.log("Búsqueda realizada");
    };

    return (
        <nav className="EmployeeNavbar navbar navbar-expand-lg">
            <div className="container-fluid d-flex align-items-center justify-content-between">
                {/* Sección izquierda - Búsqueda y Navegación */}
                <div className="d-flex align-items-center">
                    <form
                        className="d-flex my-2 my-lg-0 EmployeeNavbar-center-search"
                        role="search"
                        onSubmit={handleSearchSubmit}
                    >
                        <input
                            className="EmployeeNavbar-search form-control me-2"
                            type="search"
                            placeholder="Buscar..."
                            aria-label="Buscar"
                            style={{ minWidth: "300px", maxWidth: "500px" }}
                        />
                        <button
                            className="EmployeeNavbar-icon btn"
                            type="submit"
                            aria-label="Buscar"
                        >
                            <i className="bi bi-search"></i>
                        </button>
                    </form>

                    <ul className="navbar-nav mb-2 mb-lg-0 ms-3">
                        <li className="EmployeeNavbar-item-home nav-item">
                            <Link
                                className="EmployeeNavbar-item-home-ini nav-link active"
                                to="/employee/HomeEmployee"
                                aria-current="page"
                            >
                                Inicio
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Logo y nombre de la marca */}
                <div className="navbar-brand d-flex flex-column align-items-center ms-3" style={{ lineHeight: "0.3" }}>
                    <div className="EmployeeNavbar-logo-placeholder mb-1">
                        <i className="bi bi-camera-fill" style={{ fontSize: "40px", color: "white" }}></i>
                    </div>
                    <span className="EmployeeNavbar-item-name-text">Fotoluna</span>
                </div>

                {/* Sección derecha - Acciones del usuario */}
                <div className="EmployeeNavbar-right d-flex align-items-center gap-3">
                    <button className="EmployeeNavbar-icon btn" aria-label="Notificaciones">
                        <i className="bi bi-bell"></i>
                    </button>
                    <button className="EmployeeNavbar-icon btn" aria-label="Configuración">
                        <i className="bi bi-gear"></i>
                    </button>
                    <div className="EmployeeNavbar-user d-flex align-items-center gap-2">
                        <div className="user-avatar">
                            <i className="bi bi-person-circle" style={{ fontSize: "24px" }}></i>
                        </div>
                        <span>Amalia</span>
                    </div>
                </div>
            </div>
        </nav>

    );
};

// export default EmployeeNavbar;
// <nav className="EmployeeNavbar navbar navbar-expand-lg bg-body-tertiary">
//     <div className="container-fluid d-flex align-items-center justify-content-between">

//         <div className="d-flex align-items-center">
//             <form
//                 className="d-flex my-2 my-lg-0 EmployeeNavbar-center-search"
//                 role="search"
//             >
//                 <input
//                     className="EmployeeNavbar-search form-control me-2"
//                     type="search"
//                     placeholder="Search"
//                     aria-label="Search"
//                     style={{ minWidth: 300, maxWidth: 500 }}
//                 />
//                 <button className="EmployeeNavbar-icon btn" type="submit">
//                     <i className="bi bi-search"></i>
//                 </button>


//             </form>
//             <ul className="navbar-nav mb-2 mb-lg-0 ms-3">
//                 <li className="EmployeeNavbar-item-home nav-item">
//                     <a className="EmployeeNavbar-item-home-ini nav-link active" aria-current="page" href="#">
//                         <li>
//                             <Link to="/employee/HomeEmployee">Inicio</Link>
//                         </li>
//                     </a>
//                 </li>
//             </ul>
//         </div>

//         <a
//             className="navbar-brand d-flex flex-column align-items-center ms-3"
//             href="#"
//             style={{ lineHeight: 0.3 }}
//         >
//             <img src={logoFotoluna} alt="Logo" className="EmployeeNavbar-logo mb-1" />
//             <span className="EmployeeNavbar-item-name-text">Fotoluna</span>
//         </a>
//     </div>
// </nav>