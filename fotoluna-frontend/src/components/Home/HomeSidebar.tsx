import "../../styles/HomeNav.css";
import "../../styles/homeSideNav.css";
import HomeButton from "../Home/HomeButton";
import { useAuth } from "../../context/useAuth";
import React from "react";

const HomeSidebar: React.FC = () => {
    const { user, loading, logout } = useAuth();

    // durante la restauración puedes mostrar skeleton o nada
    // if (loading) {
    //     return (
    //         <div className="offcanvas offcanvas-end offcanvas-custom" tabIndex={-1} id="perfilMenu" aria-labelledby="perfilMenuLabel">
    //             <div className="offcanvas-body bg-custom-2 d-flex flex-column justify-content-between">
    //                 <div className="text-center">Cargando...</div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div
            className="offcanvas offcanvas-end offcanvas-custom"
            tabIndex={-1}
            id="perfilMenu"
            aria-labelledby="perfilMenuLabel"
            data-bs-backdrop="true"
            data-bs-scroll="true"
        >
            <div className="offcanvas-header justify-content-end">
                <button
                    type="button"
                    className="sidebar-close-btn"
                    data-bs-dismiss="offcanvas"
                    aria-label="Cerrar"
                >
                    ✕
                </button>
            </div>

            <div
                className="offcanvas-body bg-custom-2 d-flex flex-column justify-content-between"
                style={{ height: "100%" }}
            >
                {/* TOP: contenido principal */}
                <div className="sidebar-main">
                    {loading ? (
                        <div className="text-center">Cargando...</div>
                    ) : !user ? (
                        <div className="text-center">
                            <div className="user-icon mb-4">
                                <i className="bi bi-person-circle"></i>
                            </div>
                            <div className="mb-3">
                                <HomeButton value="Crear cuenta" to="/registrarse" />
                            </div>
                            <HomeButton value="Iniciar Sesión" to="/iniciarSesion" />
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="user-icon d-flex align-items-center justify-content-center mb-4 gap-3">
                                <img
                                    src={user.avatar || "/img/imagenperfil.jpg"}
                                    alt={user.displayName ?? user.name ?? "Usuario"}
                                    className="rounded-circle me-2"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: "cover",
                                        border: "2px solid #fff",
                                    }}
                                />
                                <div className="text-start">
                                    <div className="fw-bold">
                                        {user.displayName ?? user.name ?? "Usuario"}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <HomeButton value="Mi Cuenta" to="/miCuenta" />
                            </div>

                            <a href="/citas" className="btn btn-perfil2 w-100 mb-3">
                                Citas
                            </a>
                            {user.role === "cliente" && user.has_storage_subscription && (
                                <a href="/fotos" className="btn btn-perfil2 w-100 mb-3">
                                    Mis Fotos
                                </a>
                            )}
                            <a href="/plan" className="btn btn-perfil2 w-100 mb-3">
                                Administrar Plan
                            </a>
                            <a href="/notificaciones" className="btn btn-perfil2 w-100 mb-3">
                                Notificaciones
                            </a>
                        </div>
                    )}
                </div>

                {/* BOTTOM: footer */}
                {!loading && (
                    <div className="sidebar-footer">
                        <div className="text-center mt-4 location-text mb-3">
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            Carrera 9A #37-20 Gaitán, Ibagué
                        </div>

                        {user ? (
                            <div className="text-center mt-4 location-text">
                                <HomeButton
                                    onClick={async () => {
                                        await logout();
                                    }}
                                >
                                    <i className="bi bi-door-open me-1"></i>
                                    <i className="bi bi-arrow-left"></i>
                                    Cerrar Sesión
                                </HomeButton>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
        // <div className="offcanvas offcanvas-end offcanvas-custom" tabIndex={-1} id="perfilMenu" aria-labelledby="perfilMenuLabel">
        //     <div className="offcanvas-header justify-content-end">
        //         <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
        //     </div>
        //     <div className="offcanvas-body bg-custom-2 d-flex flex-column justify-content-between" style={{ height: "100%" }}>

        //         {/* TOP: contenido principal (usuario o no usuario) */}
        //         <div className="sidebar-main">
        //             {!user ? (
        //                 <>
        //                     <div className="text-center">
        //                         <div className="user-icon mb-4">
        //                             <i className="bi bi-person-circle"></i>
        //                         </div>
        //                         <div className="mb-3">
        //                             <HomeButton value="Crear cuenta" to="/registrarse" />
        //                         </div>
        //                         <HomeButton value="Iniciar Sesión" to="/iniciarSesion" />
        //                     </div>
        //                 </>
        //             ) : (
        //                 <>
        //                     <div className="text-center">
        //                         <div className="user-icon d-flex align-items-center justify-content-center mb-4 gap-3">
        //                             <img
        //                                 src={user.avatar || "/img/imagenperfil.jpg"}
        //                                 alt={user.displayName ?? user.name ?? "Usuario"}
        //                                 className="rounded-circle me-2"
        //                                 style={{ width: 56, height: 56, objectFit: "cover", border: "2px solid #fff" }}
        //                             />
        //                             <div className="text-start">
        //                                 <div className="fw-bold">{user.displayName ?? user.name ?? "Usuario"}</div>
        //                             </div>
        //                         </div>

        //                         <div className="mb-3">
        //                             <HomeButton value="Mi Cuenta" to="/miCuenta" />
        //                         </div>

        //                         <a href="/citas" className="btn btn-perfil2 w-100 mb-3">Citas</a>
        //                         <a href="/fotos" className="btn btn-perfil2 w-100 mb-3">Mis Fotos</a>
        //                         <a href="/notificaciones" className="btn btn-perfil2 w-100 mb-3">Notificaciones</a>
        //                     </div>
        //                 </>
        //             )}
        //         </div>

        //         {/* BOTTOM: siempre será el footer (ubicado abajo por space-between) */}
        //         <div className="sidebar-footer">
        //             <div className="text-center mt-4 location-text mb-3">
        //                 <i className="bi bi-geo-alt-fill me-2"></i>
        //                 Carrera 9A #37-20 Gaitán, Ibagué
        //             </div>

        //             {user ? (
        //                 <div className="text-center mt-4 location-text">
        //                     <HomeButton
        //                         onClick={async () => {
        //                             await logout();
        //                         }}
        //                     >
        //                         <i className="bi bi-door-open me-1"></i>
        //                         <i className="bi bi-arrow-left"></i>
        //                         Cerrar Sesión
        //                     </HomeButton>
        //                 </div>
        //             ) : null}
        //         </div>
        //     </div>
        // </div>
    );
};

export default HomeSidebar;