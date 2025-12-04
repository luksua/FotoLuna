import React, { useState } from 'react';
import type { ProfileInfoProps } from './types/Profile';
import AvatarUpload from './AvatarUpload';
import { updateProfile } from '../../../../services/profileService';
import '../Styles/perfil/ProfileInfo.css';

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onProfileUpdate }) => {
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
                <label className="form-label fw-semibold">Foto de perfil</label>
                <AvatarUpload
                    avatar={profile.avatar}
                    onAvatarChange={setAvatar}
                />
            </div>

            {/* Name Field */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="name" className="form-label form-label-employee fw-semibold">Nombre</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className={`form-control form-control-employee ${errors.name ? 'is-invalid' : ''}`}
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu nombre"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <label className="form-label form-label-employee fw-semibold d-block">&nbsp;</label>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-employee btn-outline-primary btn-sm">
                            Cambiar
                        </button>
                        {/* <button type="button" className="btn btn-employee btn-outline-danger btn-sm">
                            Eliminar
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Email Field */}
            <div className="mb-3">
                <label htmlFor="email" className="form-label form-label-employee fw-semibold">Correo electrónico</label>
                <input
                    type="email"
                    className={`form-control form-control-employee ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                />
                {errors.email && (
                    <div className="invalid-feedback d-block">{errors.email}</div>
                )}
            </div>

            {/* Bio Field */}
            <div className="mb-4">
                <label htmlFor="bio" className="form-label form-label-employee fw-semibold">Biografía</label>
                <textarea
                    className="form-control form-control-employee"
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Una breve descripción sobre ti."
                    disabled
                />
                <div className="form-text">
                    {formData.bio || 'Fotógrafa apasionada por los paisajes y la naturaleza.'}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3 justify-content-end">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary-employee"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
};

export default ProfileInfo;