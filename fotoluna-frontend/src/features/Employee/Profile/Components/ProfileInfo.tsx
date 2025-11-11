import React, { useState } from 'react';
import type { ProfileInfoProps } from './types/Profile';
import AvatarUpload from './AvatarUpload';
import '../Styles/perfil/ProfileInfo.css';

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        name: profile.name,
        email: profile.email,
        bio: profile.bio
    });
    const [avatar, setAvatar] = useState<string | null>(profile.avatar);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onProfileUpdate({
            ...profile,
            ...formData,
            avatar
        });
    };

    const handleCancel = () => {
        setFormData({
            name: profile.name,
            email: profile.email,
            bio: profile.bio
        });
        setAvatar(profile.avatar);
    };

    return (
        <form onSubmit={handleSubmit} className="profile-info-form">
            {/* Avatar Section */}
            <div className="avatar-section mb-4">
                <label className="form-label fw-semibold">Foto de perfil</label>
                <AvatarUpload
                    avatar={avatar}
                    onAvatarChange={setAvatar}
                />
            </div>

            {/* Name Field */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold">Nombre</label>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu nombre"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold d-block">&nbsp;</label>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-primary btn-sm">
                            Cambiar
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Field */}
            <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                />
            </div>

            {/* Bio Field */}
            <div className="mb-4">
                <label htmlFor="bio" className="form-label fw-semibold">Biografía</label>
                <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Una breve descripción sobre ti."
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
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Guardar cambios
                </button>
            </div>
        </form>
    );
};

export default ProfileInfo;