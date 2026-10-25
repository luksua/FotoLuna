import React, { useState } from 'react';
import type { ProfileInfoProps } from './types/Profile';
import AvatarUpload from './AvatarUpload';
import { updateProfile } from '../../../../services/profileService';
import '../Styles/perfil/ProfileInfo.css';

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onProfileUpdate, onClose }) => {
    const [formData, setFormData] = useState({
        name: profile.name,
        email: profile.email,
        bio: profile.bio
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido.';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await updateProfile({
                name: formData.name,
                email: formData.email,
                avatar: avatar || undefined,
            });

            setMessage({
                type: 'success',
                text: response.message || 'Perfil actualizado correctamente.',
            });

            // Actualizar el perfil en el componente padre
            onProfileUpdate({
                ...profile,
                name: formData.name,
                email: formData.email,
                avatar: response.photo || profile.avatar,
            });

            // Limpiar avatar después de guardar
            setAvatar(null);
        } catch (error: any) {
            console.error('Error:', error);

            let errorMessage = 'Error al actualizar el perfil.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
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

    const handleCancel = () => {
        setFormData({
            name: profile.name,
            email: profile.email,
            bio: profile.bio
        });
        setAvatar(null);
        setErrors({});
        setMessage(null);
        if (onClose) {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-info-form">
            {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            {/* Avatar Section */}
            <div className="avatar-section mb-4">
                <AvatarUpload
                    avatar={profile.avatar}
                    onAvatarChange={setAvatar}
                />
            </div>

            {/* Name Field */}
            <div className="profile-form-group mb-3">
                <label htmlFor="name" className="profile-form-label">
                    <i className="bi bi-person me-1"></i> Nombre Completo
                </label>
                <input
                    type="text"
                    className={`profile-form-input ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre"
                />
                {errors.name && (
                    <div className="profile-invalid-feedback">{errors.name}</div>
                )}
            </div>

            {/* Email Field */}
            <div className="profile-form-group mb-3">
                <label htmlFor="email" className="profile-form-label">
                    <i className="bi bi-envelope me-1"></i> Correo Electrónico
                </label>
                <input
                    type="email"
                    className={`profile-form-input ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                />
                {errors.email && (
                    <div className="profile-invalid-feedback">{errors.email}</div>
                )}
            </div>

            {/* Bio Field */}
            <div className="profile-form-group mb-4">
                <label htmlFor="bio" className="profile-form-label">
                    <i className="bi bi-chat-quote me-1"></i> Biografía / Rol
                </label>
                <textarea
                    className="profile-form-input profile-form-textarea"
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Fotógrafo profesional en FotoLuna."
                    disabled
                />
                <div className="profile-form-hint">
                    <i className="bi bi-info-circle me-1"></i>
                    {formData.bio || 'Fotógrafo y creativo profesional del equipo FotoLuna.'}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-form-actions">
                <button
                    type="button"
                    className="btn-profile-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn-profile-save"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-lg me-1"></i>
                            Guardar cambios
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileInfo;