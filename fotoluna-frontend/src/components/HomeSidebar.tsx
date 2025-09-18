import React from "react";
import "../styles/HomeNav.css";
import "../styles/homeSideNav.css";

const HomeSidebar: React.FC = () => {
    return (
        <div
            className="offcanvas offcanvas-end offcanvas-custom"
            tabIndex={-1}
            id="perfilMenu"
            aria-labelledby="perfilMenuLabel"
        >
            <div className="offcanvas-header justify-content-end">
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Cerrar"
                ></button>
            </div>
            <div className="offcanvas-body bg-custom-2 d-flex flex-column justify-content-between">

                <div className="text-center">
                    <div className="user-icon d-flex align-items-center justify-content-center mb-4 gap-4">
                        <i className="bi bi-person-circle fs-1"></i>
                        <a href="registro.html" className="btn btn-perfil w-100 mb-3">Mi cuenta</a>
                    </div>
                    <a href="{{ route('appointment.index') }}" className="btn btn-perfil2 w-100 mb-3">Citas</a>
                    <a href="{{ route('event.index') }}" className="btn btn-perfil2 w-100 mb-3">Eventos</a>
                    <a href="<!-- aqui ruta usuarios -->" className="btn btn-perfil2 w-100 mb-3">Usuarios</a>
                    <a href="" className="btn btn-perfil2 w-100 mb-3">Mis Fotos</a>
                    <a href="" className="btn btn-perfil2 w-100 mb-3">Notificaciones</a>
                    <button className="btn btn-perfil w-100 mb-3">Cerrar Sesión</button>
                </div>

                <div className="text-center mt-4 location-text">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Carrera 9A #37-20 Gaitán, Ibagué
                </div>
            </div>
        </div>
    );
};

export default HomeSidebar;