
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import React from "react";
import "../styles/home.css";


const EmployeeHome: React.FC = () => {
    return (
        <HomeLayout>
            <section className="welcome-section">
                <div className="welcome-text">
                    <h2>¡Bienvenida, Amalia!</h2>
                    <p>Es un día perfecto para crear fotos increíbles</p>
                </div>
                <div className="weather-info">
                    <div className="weather-icon">
                        <i className="fas fa-cloud-sun"></i>
                    </div>
                    <div className="weather-details">
                        <h3>25°C</h3>
                        <p>Parcialmente nublado</p>
                    </div>
                </div>
            </section>
            
            <div className="dashboard">
                <div className="card citos">
                    <div className="card-header">
                        <div className="card-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <h3>Citas</h3>
                    </div>
                    <p>Gestiona y visualiza las citas programadas con los clientes</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">5</div>
                            <div className="stat-label">Hoy</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">12</div>
                            <div className="stat-label">Esta semana</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">2</div>
                            <div className="stat-label">Próximas</div>
                        </div>
                    </div>
                </div>

                <div className="card nube">
                    <div className="card-header">
                        <div className="card-icon">
                            <i className="fas fa-cloud"></i>
                        </div>
                        <h3>Nube</h3>
                    </div>
                    <p>Accede a tus archivos y proyectos en la nube de forma segura</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">78%</div>
                            <div className="stat-label">Espacio usado</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">247</div>
                            <div className="stat-label">Archivos</div>
                        </div>
                    </div>
                </div>

                <div className="card subir">
                    <div className="card-header">
                        <div className="card-icon">
                            <i className="fas fa-upload"></i>
                        </div>
                        <h3>Subir</h3>
                    </div>
                    <p>Sube nuevas fotos y proyectos al sistema para su procesamiento</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">15</div>
                            <div className="stat-label">Pendientes</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">3.2GB</div>
                            <div className="stat-label">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard">
                <div className="card administrar">
                    <div className="card-header">
                        <div className="card-icon">
                            <i className="fas fa-cogs"></i>
                        </div>
                        <h3>Administrar</h3>
                    </div>
                    <p>Gestiona configuraciones del sistema y preferencias de usuario</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">8</div>
                            <div className="stat-label">Ajustes</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">3</div>
                            <div className="stat-label">Pendientes</div>
                        </div>
                    </div>
                </div>

                <div className="card clientes">
                    <div className="card-header">
                        <div className="card-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <h3>Clientes</h3>
                    </div>
                    <p>Consulta y gestiona la información de los clientes de FotoLuna</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">142</div>
                            <div className="stat-label">Total</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">5</div>
                            <div className="stat-label">Nuevos</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-icon" style={{background: "var(--pastel-lilac)"}}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Estadísticas</h3>
                    </div>
                    <p>Revisa el rendimiento y las métricas de tu trabajo</p>
                    <div className="card-stats">
                        <div className="stat">
                            <div className="stat-value">94%</div>
                            <div className="stat-label">Satisfacción</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">28</div>
                            <div className="stat-label">Proyectos</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="activity-section">
                <h2 className="section-title">
                    <i className="fas fa-chart-bar"></i>
                    Resumen de Actividad
                </h2>
                <div className="activity-grid">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-camera"></i>
                        </div>
                        <div className="activity-value">47</div>
                        <div className="activity-label">Fotos Editadas</div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-user-clock"></i>
                        </div>
                        <div className="activity-value">12h</div>
                        <div className="activity-label">Tiempo Activo</div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div className="activity-value">28</div>
                        <div className="activity-label">Archivos Subidos</div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-comments"></i>
                        </div>
                        <div className="activity-value">16</div>
                        <div className="activity-label">Comentarios</div>
                    </div>
                </div>
            </div>

            <footer>
                <p>FotoLuna &copy;  </p>
            </footer>
        </HomeLayout>
    );
};

export default EmployeeHome;