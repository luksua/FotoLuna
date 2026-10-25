import React, { useRef, useState, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import type { ReactCropperElement } from 'react-cropper';
import type { AvatarUploadProps } from './types/Profile';
import '../../../../styles/cropper.css';
import '../Styles/perfil/AvatarUpload.css';

interface AvatarUploadState {
    preview: string | null;
    file: File | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatar, onAvatarChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<ReactCropperElement>(null);

    const [avatarState, setAvatarState] = useState<AvatarUploadState>({
        preview: avatar,
        file: null,
    });
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [showCropperModal, setShowCropperModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!avatarState.file) {
            setAvatarState(prev => ({ ...prev, preview: avatar }));
        }
    }, [avatar, avatarState.file]);

    const handleAvatarClick = () => {
        setErrorMessage(null);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar formato y tamaño
        if (!/^image\/(jpeg|png|jpg|webp)$/i.test(file.type)) {
            setErrorMessage('Formato no permitido. Por favor usa JPG, PNG o WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('La imagen supera el tamaño máximo permitido de 5MB.');
            return;
        }

        setErrorMessage(null);
        const imageUrl = URL.createObjectURL(file);
        setRawImage(imageUrl);
        setShowCropperModal(true);
    };

    const handleApplyCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400,
            imageSmoothingQuality: 'high',
        });

        if (!canvas) return;

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                const newPreview = URL.createObjectURL(blob);
                setAvatarState({ preview: newPreview, file: croppedFile });
                onAvatarChange(croppedFile);
                setShowCropperModal(false);

                if (rawImage && rawImage.startsWith('blob:')) {
                    URL.revokeObjectURL(rawImage);
                }
                setRawImage(null);

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            'image/jpeg',
            0.92
        );
    };

    const handleCancelCrop = () => {
        setShowCropperModal(false);
        if (rawImage && rawImage.startsWith('blob:')) {
            URL.revokeObjectURL(rawImage);
        }
        setRawImage(null);
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
                    title="Haz clic para seleccionar y recortar tu foto"
                >
                    {avatarState.preview ? (
                        <img src={avatarState.preview} alt="Avatar" className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder">
                            <i className="bi bi-person-fill"></i>
                        </div>
                    )}
                    <div className="avatar-overlay">
                        <i className="bi bi-camera-fill"></i>
                    </div>
                </div>

                <div className="avatar-actions">
                    <button
                        type="button"
                        className="btn-change-avatar"
                        onClick={handleAvatarClick}
                    >
                        <i className="bi bi-camera-fill me-1"></i>
                        Cambiar foto
                    </button>
                    <span className="avatar-format-hint">JPG, PNG o WEBP (Máx. 5MB)</span>
                    {errorMessage && (
                        <span className="avatar-error-text">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {errorMessage}
                        </span>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="d-none"
            />

            {/* Modal de recorte tipo SignUp */}
            {showCropperModal && (
                <div className="avatar-cropper-overlay" onClick={handleCancelCrop}>
                    <div className="avatar-cropper-card" onClick={(e) => e.stopPropagation()}>
                        <div className="avatar-cropper-header">
                            <div className="d-flex align-items-center gap-2">
                                <div className="avatar-cropper-icon">
                                    <i className="bi bi-crop"></i>
                                </div>
                                <div>
                                    <h5 className="avatar-cropper-title">Recortar Foto de Perfil</h5>
                                    <p className="avatar-cropper-subtitle">Ajusta el encuadre para tu foto de empleado</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="avatar-cropper-close"
                                onClick={handleCancelCrop}
                                aria-label="Cerrar recorte"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="avatar-cropper-body">
                            {rawImage && (
                                <Cropper
                                    src={rawImage}
                                    style={{ height: 320, width: '100%' }}
                                    initialAspectRatio={1}
                                    aspectRatio={1}
                                    guides={true}
                                    cropBoxResizable={true}
                                    viewMode={1}
                                    ref={cropperRef}
                                    minCropBoxHeight={50}
                                    minCropBoxWidth={50}
                                    background={false}
                                    responsive={true}
                                    checkOrientation={false}
                                />
                            )}
                        </div>

                        <div className="avatar-cropper-footer">
                            <button
                                type="button"
                                className="btn-cropper-cancel"
                                onClick={handleCancelCrop}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-cropper-save"
                                onClick={handleApplyCrop}
                            >
                                <i className="bi bi-check2-circle me-1"></i>
                                Guardar recorte
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;