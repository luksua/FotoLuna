import React from 'react';
import '../Styles/perfil/SecuritySettings.css';

const SecuritySettings: React.FC = () => {
    return (
        <div className="security-settings">
            <div className="mb-4">
                <h5 className="fw-semibold mb-3">Cambiar Contraseña</h5>

                <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Contraseña actual</label>
                    <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        placeholder="Ingresa tu contraseña actual"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nueva contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        placeholder="Ingresa tu nueva contraseña"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar nueva contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirma tu nueva contraseña"
                    />
                </div>

                <button className="btn btn-primary">
                    Actualizar contraseña
                </button>
            </div>

            <div className="security-options">
                <h5 className="fw-semibold mb-3">Opciones de Seguridad</h5>

                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="twoFactor" />
                    <label className="form-check-label" htmlFor="twoFactor">
                        Autenticación de dos factores
                    </label>
                </div>

                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                    <label className="form-check-label" htmlFor="emailNotifications">
                        Notificaciones por correo electrónico
                    </label>
                </div>

                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="loginAlerts" defaultChecked />
                    <label className="form-check-label" htmlFor="loginAlerts">
                        Alertas de inicio de sesión
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;