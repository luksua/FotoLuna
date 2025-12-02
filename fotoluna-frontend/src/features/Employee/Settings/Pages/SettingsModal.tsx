import React, { useState } from 'react';
import type { SettingsModalProps, SettingsOption } from '../Components/types/Settings';
import '../Styles/Settings/SettingsModal.css';

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
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
            id: 'theme',
            label: 'Tema',
            description: 'Seleccionar el tema de la aplicación',
            icon: 'bi-palette',
            type: 'select',
            options: ['Claro', 'Oscuro', 'Automático']
        }
    ];

    if (!isOpen) return null;

    return (
        <div
            className="settings-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="settings-modal-header">
                    <div className="settings-title-section">
                        <i className="bi bi-gear-fill settings-title-icon"></i>
                        <h2 className="settings-modal-title">Configuración</h2>
                    </div>
                    <button className="settings-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="settings-modal-body">
                    <div className="settings-categories">

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
                                                    onChange={() =>
                                                        setSettings(prev => ({
                                                            ...prev,
                                                            [option.id]: !prev[option.id as keyof typeof settings]
                                                        }))
                                                    }
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
                                    <div className="storage-bar">
                                        <div
                                            className="storage-progress-fill"
                                            style={{ width: '7.44%' }}
                                        ></div>
                                    </div>
                                </div>
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
