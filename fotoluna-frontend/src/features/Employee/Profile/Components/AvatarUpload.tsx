import React, { useRef } from 'react';
import type { AvatarUploadProps } from './types/Profile';
import '../Styles/perfil/AvatarUpload.css';

const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatar, onAvatarChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onAvatarChange(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        onAvatarChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="avatar-upload">
            <div className="avatar-preview-container">
                <div
                    className="avatar-preview"
                    onClick={handleAvatarClick}
                >
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder">
                            <i className="bi bi-person-fill"></i>
                        </div>
                    )}
                    <div className="avatar-overlay">
                        <i className="bi bi-camera"></i>
                    </div>
                </div>

                <div className="avatar-actions mt-3">
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={handleAvatarClick}
                    >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Cambiar
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleRemoveAvatar}
                        disabled={!avatar}
                    >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                    </button>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="d-none"
            />
        </div>
    );
};

export default AvatarUpload;