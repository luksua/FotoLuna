import React, { useRef, useState } from 'react';
import type { AvatarUploadProps } from './types/Profile';
import '../Styles/perfil/AvatarUpload.css';

interface AvatarUploadState {
    preview: string | null;
    file: File | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatar, onAvatarChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarState, setAvatarState] = useState<AvatarUploadState>({
        preview: avatar,
        file: null,
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = event.target?.result as string;
                setAvatarState({ preview, file });
                // Pasar el archivo al componente padre
                onAvatarChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    // const handleRemoveAvatar = () => {
    //     onAvatarChange(null);
    //     if (fileInputRef.current) {
    //         fileInputRef.current.value = '';
    //     }
    // };

    return (
        <div className="avatar-upload">
            <div className="avatar-preview-container">
                <div
                    className="avatar-preview"
                    onClick={handleAvatarClick}
                >
                    {avatarState.preview ? (
                        <img src={avatarState.preview} alt="Avatar" className="avatar-image" />
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
                    {/* <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleRemoveAvatar}
                        disabled={!avatarState.preview}
                    >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                    </button> */}
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