import React, { useState } from 'react';
import type { SettingsModalProps, SettingsOption } from '../Components/types/Settings';
import '../Styles/Settings/SettingsModal.css';
import { ConfirmModal } from "../../../../components/ConfirmModal";
import { useAuth } from '../../../../context/useAuth';
import { useNavigate } from "react-router-dom";

const SettingsModal: React.FC<SettingsModalProps> = ({
    onClose,
    onLogout
}) => {
    const [settings, setSettings] = useState({
        notifications: true,
        autoSave: true,
        highQuality: false,
        watermark: true,
        theme: 'light'
    });

    const settingsOptions: SettingsOption[] = [
        {
            id: 'notifications',
            label: 'Notificaciones',
            description: 'Recibir notificaciones de nuevas fotos y actividades',
            icon: 'bi-bell',
            type: 'toggle',
            value: settings.notifications
        },
        {
            id: 'autoSave',
            label: 'Guardado automático',
            description: 'Guardar automáticamente los cambios en las fotos',
            icon: 'bi-cloud-arrow-down',
            type: 'toggle',
            value: settings.autoSave
        },
        {
            id: 'highQuality',
            label: 'Alta calidad',
            description: 'Subir fotos en máxima calidad (usa más espacio)',
            icon: 'bi-star',
            type: 'toggle',
            value: settings.highQuality
        },
        {
            id: 'watermark',
            label: 'Marca de agua',
            description: 'Agregar marca de agua a las fotos subidas',
            icon: 'bi-camera',
            type: 'toggle',
            value: settings.watermark
        },
        {
            id: 'theme',
            label: 'Tema',
            description: 'Seleccionar el tema de la aplicación',
            icon: 'bi-palette',
            type: 'select',
            options: ['Claro', 'Oscuro', 'Automático']
        }
    ];

    const [modal, setModal] = useState(false);

    const navigate = useNavigate();

    const handleToggle = (settingId: string) => {
        setSettings(prev => ({
            ...prev,
            [settingId]: !prev[settingId as keyof typeof settings]
        }));
    };

    const { logout } = useAuth();

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-modal-header">
                    <div className="settings-title-section">
                        <i className="bi bi-gear-fill settings-title-icon"></i>
                        <h2 className="settings-modal-title">Configuración</h2>
                    </div>
                    <button
                        className="settings-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar configuración"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="settings-modal-body">
                    <div className="settings-categories">
                        {/* Configuración General */}
                        <div className="settings-category">
                            <h3 className="settings-category-title">
                                <i className="bi bi-sliders"></i>
                                Preferencias Generales
                            </h3>

                            {settingsOptions.map((option) => (
                                <div key={option.id} className="settings-option">
                                    <div className="settings-option-info">
                                        <div className="settings-option-icon">
                                            <i className={`bi ${option.icon}`}></i>
                                        </div>
                                        <div className="settings-option-content">
                                            <h4 className="settings-option-label">{option.label}</h4>
                                            <p className="settings-option-description">{option.description}</p>
                                        </div>
                                    </div>

                                    <div className="settings-option-control">
                                        {option.type === 'toggle' && (
                                            <div className="settings-toggle">
                                                <input
                                                    type="checkbox"
                                                    id={option.id}
                                                    checked={settings[option.id as keyof typeof settings] as boolean}
                                                    onChange={() => handleToggle(option.id)}
                                                    className="settings-toggle-input"
                                                />
                                                <label htmlFor={option.id} className="settings-toggle-slider"></label>
                                            </div>
                                        )}

                                        {option.type === 'select' && (
                                            <select className="settings-select">
                                                {option.options?.map((opt) => (
                                                    <option key={opt} value={opt.toLowerCase()}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Espacio de Almacenamiento */}
                        <div className="settings-category">
                            <h3 className="settings-category-title">
                                <i className="bi bi-hdd"></i>
                                Almacenamiento
                            </h3>

                            <div className="storage-info">
                                <div className="storage-progress">
                                    <div className="storage-details">
                                        <span className="storage-used">7.44 MB utilizados</span>
                                        <span className="storage-total">de 100 MB</span>
                                    </div>
                                    <div className="storage-bar">
                                        <div
                                            className="storage-progress-fill"
                                            style={{ width: '7.44%' }}
                                        ></div>
                                    </div>
                                    <div className="storage-percentage">7.44%</div>
                                </div>

                                <button className="btn btn-outline-primary btn-sm storage-cleanup">
                                    <i className="bi bi-trash me-1"></i>
                                    Liberar espacio
                                </button>
                            </div>
                        </div>

                        {/* Sesión */}
                        <div className="settings-category">
                            <h3 className="settings-category-title">
                                <i className="bi bi-person"></i>
                                Sesión
                            </h3>

                            <div className="session-actions">
                                <button className="btn btn-outline-secondary session-btn">
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Sincronizar datos
                                </button>

                                <button
                                    className="btn btn-danger logout-btn"
                                    onClick={() => setModal(true)}>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Cerrar sesión
                                </button>

                                <ConfirmModal
                                    isOpen={modal}
                                    onClose={() => setModal(false)}
                                    onConfirm={async () => {
                                        await logout();
                                        navigate("/", { replace: true });
                                    }}

                                    title="¿Está seguro de cerrar sesión?"
                                    type="error"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="settings-modal-footer">
                    <div className="settings-version">
                        <span className="version-text">FotoLuna v1.0.0</span>
                    </div>
                    <div className="settings-actions">
                        <button className="btn btn-outline-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary-employee">
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;