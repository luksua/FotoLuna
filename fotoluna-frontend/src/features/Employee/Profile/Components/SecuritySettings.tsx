import React, { useState } from 'react';
import { changePassword } from '../../../../services/passwordService';
import '../Styles/perfil/SecuritySettings.css';

interface SecuritySettingsProps {
    onClose?: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'La contraseña actual es requerida.';
        }
        if (!newPassword.trim()) {
            newErrors.newPassword = 'La nueva contraseña es requerida.';
        }
        if (newPassword.length < 8) {
            newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Debes confirmar la contraseña.';
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden.';
        }
        if (currentPassword === newPassword) {
            newErrors.newPassword = 'La nueva contraseña no puede ser igual a la actual.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            setMessage({
                type: 'success',
                text: response.message || 'Contraseña actualizada correctamente.',
            });

            // Limpiar formulario
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
        } catch (error: any) {
            console.error('Error:', error);
            
            // Extraer mensaje de error del servidor
            let errorMessage = 'Error al actualizar la contraseña.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Si hay errores de validación
                const validationErrors = error.response.data.errors;
                errorMessage = Object.values(validationErrors).flat().join(', ');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setMessage({
                type: 'error',
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="security-settings">
            <div className="mb-4">
                <h5 className="fw-semibold mb-3">Cambiar Contraseña</h5>

                {message && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="security-form">
                    <div className="security-form-group mb-3">
                        <label htmlFor="currentPassword" className="security-form-label">
                            <i className="bi bi-key me-1"></i> Contraseña actual
                        </label>
                        <input
                            type="password"
                            className={`security-form-input ${errors.currentPassword ? 'is-invalid' : ''}`}
                            id="currentPassword"
                            placeholder="Ingresa tu contraseña actual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        {errors.currentPassword && (
                            <div className="security-invalid-feedback">{errors.currentPassword}</div>
                        )}
                    </div>

                    <div className="security-form-group mb-3">
                        <label htmlFor="newPassword" className="security-form-label">
                            <i className="bi bi-lock me-1"></i> Nueva contraseña
                        </label>
                        <input
                            type="password"
                            className={`security-form-input ${errors.newPassword ? 'is-invalid' : ''}`}
                            id="newPassword"
                            placeholder="Mínimo 8 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        {errors.newPassword && (
                            <div className="security-invalid-feedback">{errors.newPassword}</div>
                        )}
                    </div>

                    <div className="security-form-group mb-4">
                        <label htmlFor="confirmPassword" className="security-form-label">
                            <i className="bi bi-shield-lock me-1"></i> Confirmar nueva contraseña
                        </label>
                        <input
                            type="password"
                            className={`security-form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            id="confirmPassword"
                            placeholder="Repite la nueva contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && (
                            <div className="security-invalid-feedback">{errors.confirmPassword}</div>
                        )}
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        {onClose && (
                            <button
                                type="button"
                                className="btn-profile-cancel"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn-security-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-shield-check me-1"></i>
                                    Actualizar contraseña
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="security-options" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e9ecef' }}>
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